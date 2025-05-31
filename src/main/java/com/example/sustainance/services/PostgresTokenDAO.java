package com.example.sustainance.services;
import com.example.sustainance.interfaces.TokensDAO;
import com.example.sustainance.models.userAuth.*;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PostgresTokenDAO implements TokensDAO{
    private static final String URL = System.getenv("DATABASE_URL");
    private static final String USER = System.getenv("POSTGRES_USERNAME");
    private static final String PASSWORD = System.getenv("POSTGRES_PASSWORD");

    private Connection connection;

    public PostgresTokenDAO() throws SQLException {
        connect();
    }

    private void connect() throws SQLException {
        connection = DriverManager.getConnection(URL, USER, PASSWORD);
    }

    private void close() {
        try {
            if (connection != null && !connection.isClosed())
                connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private List<Map<String, Object>> executeQuery(String query) {
        List<Map<String, Object>> resultList = new ArrayList<>();

        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            ResultSetMetaData meta = rs.getMetaData();
            int columnCount = meta.getColumnCount();

            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>(); // preserves column order
                for (int i = 1; i <= columnCount; i++) {
                    String column = meta.getColumnLabel(i);
                    Object value = rs.getObject(i);
                    row.put(column, value);
                }
                resultList.add(row);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return resultList;
    }

    private int executeUpdate(String sql) {
        try (Statement stmt = connection.createStatement()) {
            return stmt.executeUpdate(sql);
        } catch (SQLException e) {
            e.printStackTrace();
            return -1;
        }
    }

    private String hash(String arg) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(arg.getBytes()));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteExpiredTokens() {
        String query = "DELETE FROM \"AutoLogTokens\" WHERE \"ExpiryDate\"::date < CURRENT_DATE;";
        executeUpdate(query);
    }

    @Override
    public void addNewToken(createTokenRequest request) {
        String token = UUID.randomUUID().toString();

        LocalDate nextMonth = LocalDate.now().plusMonths(1);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String expiryDate = nextMonth.format(formatter);

        String update = "INSERT INTO \"AutoLogTokens\" (\"UserEmail\", \"Token\", \"ExpiryDate\") " +
                "VALUES ('"+request.getEmail()+"', '"+token+"', '"+expiryDate+"');";
        this.executeUpdate(update);
    }

    @Override
    public getTokenResponse getToken(getTokenRequest request) {
        this.deleteExpiredTokens();

        String email = request.getEmail();

        String query = "SELECT \"Token\" FROM \"AutoLogTokens\" " +
                "WHERE \"UserEmail\" = '" + email + "'";

        List<Map<String, Object>> result = executeQuery(query);

        if (!result.isEmpty()) {
            Map<String, Object> row = result.get(0);
            String token = (String) row.get("Token");
            return new getTokenResponse(token);
        }

        return new getTokenResponse("");
    }

    @Override
    public attemptTokenAuthResponse attemptTokenAuth(attemptTokenAuthRequest request) {
        this.deleteExpiredTokens();

        String token = request.getToken();

        String query = "SELECT \"UserEmail\" FROM \"AutoLogTokens\" " +
                "WHERE \"Token\" = '" + token + "'";

        List<Map<String, Object>> result = executeQuery(query);

        if (!result.isEmpty()) {
            Map<String, Object> row = result.get(0);
            String email = (String) row.get("UserEmail");
            return new attemptTokenAuthResponse(email);
        }

        return new attemptTokenAuthResponse("");
    }
}
