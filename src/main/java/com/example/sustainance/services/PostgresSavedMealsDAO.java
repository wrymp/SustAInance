package com.example.sustainance.services;
import com.example.sustainance.interfaces.SavedMealsDAO;
import com.example.sustainance.interfaces.UserDAO;
import com.example.sustainance.models.ingredients.addMealRequest;
import com.example.sustainance.models.ingredients.getMealsRequest;
import com.example.sustainance.models.ingredients.getMealsResponse;
import com.example.sustainance.models.userAuth.RegisterUserRequest;
import com.example.sustainance.models.userAuth.attemptLogInRequest;
import com.example.sustainance.models.userAuth.getTokenResponse;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.*;
import java.util.*;

@Service
public class PostgresSavedMealsDAO implements SavedMealsDAO {
    private static final String URL = System.getenv("DATABASE_URL");
    private static final String USER = System.getenv("POSTGRES_USERNAME");
    private static final String PASSWORD = System.getenv("POSTGRES_PASSWORD");

    private Connection connection;

    public PostgresSavedMealsDAO() {
        connect();
    }

    private void connect() {
        try {
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
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

    @Override
    public void addNewMeal(addMealRequest request) {
        String update = "INSERT INTO \"FavoriteMeals\" (\"UserEmail\", \"Meal\") " +
                "VALUES ('"+request.getEmail()+"', '"+request.getMeal()+"');";
        this.executeUpdate(update);
    }

    @Override
    public getMealsResponse getMeals(getMealsRequest request) {
        String email = request.getEmail();

        String query = "SELECT \"Meal\" FROM \"FavoriteMeals\" " +
                "WHERE \"UserEmail\" = '" + email + "'";

        List<Map<String, Object>> results = executeQuery(query);

        ArrayList<String> resultMeals = new ArrayList<>();
        if (!results.isEmpty()) {
            for (Map<String, Object> row : results){
                String meal = (String) row.get("Meal");
                resultMeals.add(meal);
            }
        }


        String cleanup = "DELETE FROM \"FavoriteMeals\" WHERE " +
                "(\"UserEmail\", \"Date\") NOT IN (SELECT \"UserEmail\", \"Date\" FROM \"FavoriteMeals\" " +
                "WHERE \"UserEmail\" = '"+email+"' ORDER BY \"Date\" DESC LIMIT 10 );";
        executeUpdate(cleanup);

        return new getMealsResponse(resultMeals.toArray(new String[0]));
    }
}
