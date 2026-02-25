import { analyzePDF } from "../services/AnalyzepdfService.js";
import { upload as fileUploader } from "../middlewares/multerConfig.js";

export default class AnalyzePdfController {
  /**
   * Analyzes uploaded PDF files and returns the analysis results.
   * 
   * This method handles requests for analyzing PDF files. It first ensures that files
   * are provided in the request, then maps over each file to call a service that performs
   * the PDF analysis. The results from each analysis are returned in the response.
   * 
   * @method analyzePdf
   * @param {Object} req - The request object containing the uploaded PDF files.
   * @param {Object} res - The response object used to send the results or errors.
   * @param {Function} next - The next middleware function in the request-response cycle.
   * 
   * @returns {Object} Returns a JSON object with a success status and an array of results if successful.
   * @throws {Error} If no files are uploaded, responds with a 400 status and an error message.
   */
  analyzePdf = [
    fileUploader.array("pdfs", 10),

    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: "PDF files are missing" });
        }

        const tasks = req.files.map((file) =>
          analyzePdf(file.path, file.originalname)
        );

        const results = await Promise.all(tasks);

        res.json({ success: true, results });
      } catch (err) {
        next(err);
      }
    },
  ];
}