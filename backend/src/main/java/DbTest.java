import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&ssl=true&sslmode=require";
        String user = "postgres.mdcrhrvhxfbkseuozkea";
        String pass = "Devops@99ops";

        System.out.println("Testing connection to: " + url);
        System.out.println("User: " + user);

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            System.out.println("SUCCESS: Connected to database!");
            System.out.println("Schema: " + conn.getSchema());
        } catch (SQLException e) {
            System.err.println("FAILURE: Could not connect.");
            e.printStackTrace();
        }
    }
}
