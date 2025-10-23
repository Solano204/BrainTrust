// package com.braintrust.containerapp.rest;


// import com.braintrust.test;
// import com.braintrust.education.domain.testE;
// import com.braintrust.identity.domain.valueobjects.UserId;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/dashboard")
// public class controllers {

//     test testAi = new test();
//     testE testEd = new testE();
//     UserId userId = UserId.generate();
//     @GetMapping
//     public ResponseEntity<?> getDashboard() {
//         // Combine data from all modules
//         var dashboardData = new DashboardResponse(
//                 "k","k","j"
//         );

//         testAi.test();
//         testEd.testWelcome();
//         System.out.println("id generated " + userId);
//         return ResponseEntity.ok(dashboardData);
//     }

//     // DTO for response
//     public record DashboardResponse(
//             Object courses,
//             Object userStats,
//             Object aiActivity
//     ) {}
// }
