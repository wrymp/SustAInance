//package com.example.sustainance.services;
//import com.example.sustainance.interfaces.UserDAO;
//import com.example.sustainance.models.userAuth.RegisterUserRequest;
//import com.example.sustainance.models.userAuth.attemptLogInRequest;
//import org.springframework.stereotype.Service;
//
//import java.security.MessageDigest;
//import java.security.NoSuchAlgorithmException;
//import java.sql.*;
//import java.util.*;
//
//@Service
//public class PostgresUserDAO implements UserDAO{
//    private static final String URL = System.getenv("DATABASE_URL");
//    private static final String USER = System.getenv("POSTGRES_USERNAME");
//    private static final String PASSWORD = System.getenv("POSTGRES_PASSWORD");
//
//    private Connection connection;
//
//    public PostgresUserDAO() throws SQLException {
//        connect();
//    }
//
//    private void connect() throws SQLException {
//        connection = DriverManager.getConnection(URL, USER, PASSWORD);
//    }
//
//    private void close() {
//        try {
//            if (connection != null && !connection.isClosed())
//                connection.close();
//        } catch (SQLException e) {
//            e.printStackTrace();
//        }
//    }
//
//    private List<Map<String, Object>> executeQuery(String query) {
//        List<Map<String, Object>> resultList = new ArrayList<>();
//
//        try (Statement stmt = connection.createStatement();
//             ResultSet rs = stmt.executeQuery(query)) {
//
//            ResultSetMetaData meta = rs.getMetaData();
//            int columnCount = meta.getColumnCount();
//
//            while (rs.next()) {
//                Map<String, Object> row = new LinkedHashMap<>(); // preserves column order
//                for (int i = 1; i <= columnCount; i++) {
//                    String column = meta.getColumnLabel(i);
//                    Object value = rs.getObject(i);
//                    row.put(column, value);
//                }
//                resultList.add(row);
//            }
//
//        } catch (SQLException e) {
//            e.printStackTrace();
//        }
//
//        return resultList;
//    }
//
//    private int executeUpdate(String sql) {
//        try (Statement stmt = connection.createStatement()) {
//            return stmt.executeUpdate(sql);
//        } catch (SQLException e) {
//            e.printStackTrace();
//            return -1;
//        }
//    }
//
//    private String hash(String arg) {
//        try {
//            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(arg.getBytes()));
//        } catch (NoSuchAlgorithmException e) {
//            throw new RuntimeException(e);
//        }
//    }
//
//    @Override
//    public boolean alreadyRegistered(String email) {
//        String query = "SELECT * FROM \"UserTable\" WHERE \"UserEmail\" = '"+email+"';";
//        List<Map<String, Object>> result = this.executeQuery(query);
//        return !result.isEmpty();
//    }
//
//    @Override
//    public void registerUser(RegisterUserRequest request) {
//        String mangledPassword = this.hash(request.getPassword());
//        String update = "INSERT INTO \"UserTable\" (\"UserEmail\", \"Password\", \"MascotEnabled\", \"Preference\") " +
//                "VALUES ('"+request.getEmail()+"', '"+mangledPassword+"', false, '');";
//        this.executeUpdate(update);
//    }
//
//    @Override
//    public boolean userExists(String email) {
//        String query = "SELECT * FROM \"UserTable\" WHERE \"UserEmail\" = '"+email+"';";
//        List<Map<String, Object>> result = this.executeQuery(query);
//        return !result.isEmpty();
//    }
//
//    @Override
//    public boolean checkCredentials(attemptLogInRequest request) {
//        String mangledPassword = this.hash(request.getPassword());
//        String query = "SELECT * FROM \"UserTable\" WHERE \"UserEmail\" = '"+request.getEmail()+"' AND \"Password\" = '"+mangledPassword+"';";
//        List<Map<String, Object>> result = this.executeQuery(query);
//        return !result.isEmpty();
//    }
//}
