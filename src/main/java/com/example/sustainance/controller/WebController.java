package com.example.sustainance.controller;

import com.example.sustainance.constants.baseIngredients;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/recipe/generator")
    public String recipeGenerator(Model model) {
        // Make sure this line is working
        model.addAttribute("baseIngredients", baseIngredients.BASE_INGREDIENTS);
        return "recipe/generator";
    }

    @GetMapping("/recipe/preferences")
    public String preferenceSelector(Model model) {
        // Make sure this line is working
        return "recipe/preferences";
    }

    @GetMapping("/recipe/plan")
    public String mealPlanGenerator(Model model) {
        // Make sure this line is working
        return "recipe/plan";
    }

    @GetMapping("/recipe/fauxlogin")
    public String fauxLogin(Model model) {
        // Make sure this line is working
        return "recipe/fauxLogin";
    }

    @GetMapping("/recipe/overviewer")
    public String overviewer(Model model) {
        // Make sure this line is working
        return "recipe/overviewer";
    }
}
