import fs from "fs";
import path from "path";

class PlainTextReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || "docs/qa/reports/latest-test-report.txt";
    this.screenshotDir = options.screenshotDir || "docs/qa/reports/screenshots";
    this.totalTests = 0;
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.flaky = 0;
    this.failures = [];
    this.startTime = null;
    this.endTime = null;
  }

  onBegin(config, suite) {
    this.startTime = new Date();
    this.totalTests = suite.allTests().length;
    this.config = config;
  }

  onTestEnd(test, result) {
    if (result.status === "passed") {
      if (result.retry > 0) {
        this.flaky++;
      } else {
        this.passed++;
      }
    } else if (result.status === "skipped") {
      this.skipped++;
    } else if (result.status === "failed" || result.status === "timedOut") {
      this.failed++;
      
      const annotations = test.annotations || [];
      const errorMsg = result.error ? result.error.message : "Unknown error";
      const stack = result.error && result.error.stack ? result.error.stack : "";
      
      // Look for screenshots
      const screenshots = [];
      if (result.attachments) {
        for (const att of result.attachments) {
          if (att.name === "screenshot" || att.contentType?.startsWith("image/")) {
            if (att.path && fs.existsSync(att.path)) {
              // Copy to docs/qa/reports/screenshots with sanitized name
              const sanitizedTitle = test.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
              const destName = `${sanitizedTitle}-${Date.now()}.png`;
              const destPath = path.join(this.screenshotDir, destName);
              try {
                fs.mkdirSync(this.screenshotDir, { recursive: true });
                fs.copyFileSync(att.path, destPath);
                screenshots.push(destPath);
              } catch (e) {
                screenshots.push(att.path);
              }
            }
          }
        }
      }

      this.failures.push({
        title: test.title,
        file: test.location.file,
        line: test.location.line,
        project: test.parent?.project()?.name || "default",
        duration: result.duration,
        status: result.status,
        error: errorMsg,
        stack: stack,
        screenshots: screenshots,
        annotations: annotations
      });
    }
  }

  onEnd(result) {
    this.endTime = new Date();
    const durationSec = ((this.endTime - this.startTime) / 1000).toFixed(1);
    const passPct = this.totalTests > 0 ? ((this.passed / this.totalTests) * 100).toFixed(1) : "0.0";

    let report = `================================================================================
CINEPHILE AUTOMATED E2E & ACCESSIBILITY TEST REPORT
================================================================================
Execution Time: ${this.startTime.toISOString()} (${this.startTime.toLocaleString()})
Duration:       ${durationSec}s
Environment:    Node.js ${process.version} | Playwright Test
Base URL:       http://localhost:5173
Backend Core:   http://localhost:8080 (Spring Boot)
ML Service:     http://localhost:8000 (FastAPI)

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Total Tests Run:  ${this.totalTests}
Passed:           ${this.passed}
Failed:           ${this.failed}
Skipped:          ${this.skipped}
Flaky:            ${this.flaky}
Pass Rate:        ${passPct}%
Status:           ${this.failed === 0 ? "PASSED (CLEAN RUN)" : "FAILURES DETECTED"}

--------------------------------------------------------------------------------
2. DETAILED TEST OUTCOMES
--------------------------------------------------------------------------------\n`;

    if (this.failures.length === 0) {
      report += `All ${this.passed} tests passed successfully without error.\n\n`;
    } else {
      report += `Total Failures: ${this.failures.length}\n\n`;
      this.failures.forEach((f, idx) => {
        report += `[FAILURE #${idx + 1}] ${f.title}\n`;
        report += `  Project:    ${f.project}\n`;
        report += `  File:       ${f.file}:${f.line}\n`;
        report += `  Duration:   ${f.duration}ms\n`;
        report += `  Error:\n    ${f.error.split("\n").join("\n    ")}\n`;
        if (f.screenshots.length > 0) {
          report += `  Screenshot: ${f.screenshots.join(", ")}\n`;
        }
        report += `\n`;
      });
    }

    report += `--------------------------------------------------------------------------------
3. ARTIFACTS & REPORT PATHS
--------------------------------------------------------------------------------
Plain-Text Report: docs/qa/reports/latest-test-report.txt
Interactive HTML:  docs/qa/reports/html/index.html
Screenshots Dir:   docs/qa/reports/screenshots/
Failure Traces:    test-results/

To view the interactive HTML report, run:
  npm run test:e2e:report
================================================================================\n`;

    const outDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(this.outputFile, report, "utf8");
    console.log(`\n[PlainTextReporter] Saved plain-text report to ${this.outputFile}`);
  }
}

export default PlainTextReporter;
