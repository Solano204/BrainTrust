// // File: src/app/features/courses/api/page-api.ts
// "use server";

// import axios from "axios";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { Page } from "@/app/domain/entities/CourseEntities";
// import { CourseId, UnitId } from "@/app/domain/valueObjects";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// const isMockEnabled = true; // Enable mock data

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// apiClient.interceptors.request.use(
//   async (config) => {
//     const token = (await cookies()).get("session")?.value;
//     if (token) config.headers["Authorization"] = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const handleApiError = (error: unknown) => {
//   if (axios.isAxiosError(error)) {
//     const errorMessage = error.response?.data?.message || error.message;
//     redirect("/courses");
//     throw new Error(errorMessage);
//   }
//   throw error;
// };

// // Mock data for pages
// const MOCK_PAGES: Page[] = [
//   {
//     id: "page-1",
//     title: "Introduction to JavaScript",
//     welcomeTitle: "Welcome to JavaScript Fundamentals",
//     welcomeSubtitle: "Start your journey into programming",
//     sectionTitle: "Getting Started with JavaScript",
//     sectionContent: "JavaScript is a versatile programming language that runs in web browsers and on servers. In this module, you'll learn the basics of JavaScript syntax, variables, and data types.\n\nJavaScript was created in 1995 by Brendan Eich and has evolved into one of the most popular programming languages in the world.",
//     courseId: "crs-101",
//     unitId: "unit-1-1",
//     createdAt: "2024-01-10T09:00:00Z",
//     attachments: [
//       {
//         name: "javascript-cheatsheet.pdf",
//         storagePath: "/pages/cheatsheet.pdf",
//         createdAt: "2024-01-10T09:00:00Z"
//       }
//     ],
//     urlsSupport: [
//       "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
//       "https://javascript.info/"
//     ]
//   },
//   {
//     id: "page-2",
//     title: "Control Flow in Programming",
//     welcomeTitle: "Mastering Control Flow",
//     welcomeSubtitle: "Learn to direct your program's execution",
//     sectionTitle: "Conditionals and Loops",
//     sectionContent: "Control flow statements allow your program to make decisions and repeat actions. You'll learn about:\n- if/else statements\n- switch statements\n- for loops\n- while loops\n- do...while loops\n\nUnderstanding control flow is essential for writing dynamic and responsive programs.",
//     courseId: "crs-101", 
//     unitId: "unit-1-2",
//     createdAt: "2024-01-18T14:30:00Z",
//     attachments: [
//       {
//         name: "control-flow-examples.js",
//         storagePath: "/pages/examples.js",
//         createdAt: "2024-01-18T14:30:00Z"
//       }
//     ],
//     urlsSupport: [
//       "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"
//     ]
//   }
// ];

// const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// export async function fetchPagesByUnit(courseId: CourseId, unitId: UnitId): Promise<Page[]> {
//   if (isMockEnabled) {
//     await simulateDelay();
//     console.log(`MOCK: Fetching pages for course ${courseId}, unit ${unitId}`);
//     return MOCK_PAGES.filter(page => page.courseId === courseId && page.unitId === unitId);
//   }

//   try {
//     const response = await apiClient.get(`/courses/${courseId}/units/${unitId}/pages`);
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function fetchPageById(pageId: string): Promise<Page> {
//   if (isMockEnabled) {
//     await simulateDelay();
//     const page = MOCK_PAGES.find(p => p.id === pageId);
//     if (!page) {
//       throw new Error(`Page not found: ${pageId}`);
//     }
//     console.log(`MOCK: Fetching page ${pageId}`);
//     return page;
//   }

//   try {
//     const response = await apiClient.get(`/pages/${pageId}`);
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function createPage(
//   courseId: CourseId,
//   unitId: UnitId,
//   pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">
// ): Promise<Page> {
//   if (isMockEnabled) {
//     await simulateDelay(800);
//     const newPage: Page = {
//       ...pageData,
//       id: `page-${Date.now()}`,
//       courseId,
//       unitId,
//       createdAt: new Date().toISOString()
//     };
//     MOCK_PAGES.push(newPage);
//     console.log("MOCK: Created new page", newPage);
//     return newPage;
//   }

//   try {
//     const response = await apiClient.post(`/courses/${courseId}/units/${unitId}/pages`, pageData);
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function updatePage(
//   pageId: string,
//   pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>
// ): Promise<Page> {
//     console.log("Updating page:", pageId, pageData);
//   if (isMockEnabled) {
//     // await simulateDelay(600);
//     // const index = MOCK_PAGES.findIndex(page => page.id === pageId);
//     // if (index !== -1) {
//     //   MOCK_PAGES[index] = { ...MOCK_PAGES[index], ...pageData };
//     //   console.log(`MOCK: Updated page ${pageId}`,pageData);
//     //   return MOCK_PAGES[index];
//     // }
//     // throw new Error(`Page not found: ${pageId}`);
//   }

//   try {
//     // const response = await apiClient.put(`/pages/${pageId}`, pageData);
//     return pageData as Page;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function deletePage(pageId: string): Promise<void> {
//   if (isMockEnabled) {
//     await simulateDelay(400);
//     const index = MOCK_PAGES.findIndex(page => page.id === pageId);
//     if (index !== -1) {
//       MOCK_PAGES.splice(index, 1);
//       console.log(`MOCK: Deleted page ${pageId}`);
//       return;
//     }
//     throw new Error(`Page not found: ${pageId}`);
//   }

//   try {
//     await apiClient.delete(`/pages/${pageId}`);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }