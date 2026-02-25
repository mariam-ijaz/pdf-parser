import { Router } from "express";
import AnalyzePdfController from "../controller/AnalyzepdfControllers.js";

const router = Router();
const analyzePdfController = new AnalyzePdfController();
/**
 * Router for handling PDF analysis requests.
 * 
 * This router is responsible for defining the endpoints related to PDF analysis,
 * specifically handling POST requests to `/analyze-pdf` to process and analyze 
 * uploaded PDF files.
 * 
 * @module AnalyzePdfRouter
 */

router.post("/analyze-pdf", analyzePdfController.analyzePdf); 

export default router;