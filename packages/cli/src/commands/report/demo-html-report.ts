#!/usr/bin/env bun
/**
 * Demo script to generate a complete HTML report with real data
 * Usage: bun demo-html-report.ts <input-json-report> <output-html-file>
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function createHtmlReport(jsonReportPath: string, outputHtmlPath: string) {
  try {
    console.log('📊 Creating HTML report...');

    // Read the JSON report data
    const reportDataStr = await readFile(jsonReportPath, 'utf-8');
    const reportData = JSON.parse(reportDataStr);

    console.log(`✅ Loaded report data: ${reportData.summary_stats.total_runs} runs analyzed`);

    // Read the HTML template
    const templatePath = join(__dirname, 'src', 'assets', 'report_template.html');
    const templateContent = await readFile(templatePath, 'utf-8');

    console.log('✅ Loaded HTML template');

    // Inject the real data into the template
    const htmlReport = templateContent.replace(
      '<script id="report-data" type="application/json">\n        {}\n    </script>',
      `<script id="report-data" type="application/json">\n        ${JSON.stringify(reportData, null, 2)}\n    </script>`
    );

    // Write the complete HTML report
    await writeFile(outputHtmlPath, htmlReport, 'utf-8');

    console.log('🎉 HTML report generated successfully!');
    console.log(`📄 Report file: ${outputHtmlPath}`);
    console.log('💡 Open this file in your browser to view the interactive report');

    // Show summary of what's in the report
    console.log('\n📈 Report Summary:');
    console.log(`   • ${reportData.summary_stats.total_runs} total runs`);
    console.log(
      `   • ${(reportData.summary_stats.overall_success_rate * 100).toFixed(1)}% success rate`
    );
    console.log(
      `   • ${reportData.summary_stats.average_execution_time.toFixed(2)}s average execution time`
    );
    console.log(`   • ${reportData.common_trajectories.length} trajectory patterns`);
    console.log(`   • ${Object.keys(reportData.results_by_parameter).length} parameter dimensions`);
  } catch (error) {
    console.error('❌ Error creating HTML report:', error);
    process.exit(1);
  }
}

// CLI usage
if (process.argv.length < 4) {
  console.log('Usage: bun demo-html-report.ts <input-json-report> <output-html-file>');
  console.log('Example: bun demo-html-report.ts /tmp/openclawd-html-demo.json /tmp/openclawd-report.html');
  process.exit(1);
}

const [, , inputJsonPath, outputHtmlPath] = process.argv;
createHtmlReport(inputJsonPath, outputHtmlPath);
