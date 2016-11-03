package com.hexun.licaike.web;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;

public class IndexInitServlet extends HttpServlet {
	private static final long serialVersionUID = -7094715858121371177L;

	public IndexInitServlet() {
        super();
    }
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);

        
    }
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html;charset=utf-8");
		PrintWriter out = response.getWriter();
		try {
			String jsonStr;
			String path =getServletContext().getRealPath("/WEB-INF/classes/dev/api-config.json");  
			jsonStr = FileUtils.readFileToString(new File(path));
			out.print(jsonStr);
		} catch (IOException e) {
			e.printStackTrace();
			out.print("未知错误，请从新再试！");
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
