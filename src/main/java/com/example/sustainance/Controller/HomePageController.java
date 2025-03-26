package com.example.sustainance.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomePageController {

    //index page
    @GetMapping("/")
    public String index() {
        return "index";
    }
}
