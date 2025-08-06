/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.DriverManager;
import java.io.IOException;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Admin
 */
@WebServlet(urlPatterns = {"/RegistrarUsuario"})
public class RegistrarUsuario extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String Id_usuario = request.getParameter("Id_usuario");
        String Primer_nombre = request.getParameter("Primer_nombre");
        String Segundo_nombre = request.getParameter("Segundo_nombre");
        String Primer_apellido = request.getParameter("Primer_apellido");
        String Segundo_apellido = request.getParameter("Segundo_apellido");
        String Rol = request.getParameter("Rol");
        String Correo = request.getParameter("Correo");
        String Contrasena = request.getParameter("Contrasena");
        String terminos = request.getParameter("terminos");

        if (terminos != null && terminos.equals("aceptado")) {
        } else {
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            java.sql.Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost:3306/sgturnos", "root", "");

            PreparedStatement sentencia = conexion.prepareStatement("insert into usuario (Id_usuario, Primer_nombre, Segundo_nombre, Primer_apellido, Segundo_apellido, Rol, Correo,Contrasena) values(?,?,?,?,?,?,?,?)");

            sentencia.setString(1, Id_usuario);
            sentencia.setString(2, Primer_nombre);
            sentencia.setString(3, Segundo_nombre);
            sentencia.setString(4, Primer_apellido);
            sentencia.setString(5, Segundo_apellido);
            sentencia.setString(6, Rol);
            sentencia.setString(7, Correo);
            sentencia.setString(8, Contrasena);
            sentencia.executeUpdate();

            sentencia.close();
            conexion.close();

            request.setAttribute("nombre", Primer_nombre);
            request.setAttribute("apellido", Primer_apellido);
            RequestDispatcher redireccion = request.getRequestDispatcher("mensajeSGT.jsp");
            redireccion.forward(request, response);

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("Error" + e.toString());
        }
    }
}
