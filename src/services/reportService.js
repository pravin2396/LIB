// Report Service for BookStack LMS
// Aggregates real-time metrics, category distributions, monthly circulation reports, and chart data

import { bookService } from './bookService';
import { memberService } from './memberService';
import { issueService } from './issueService';
import { categoryService } from './categoryService';
import { dashboardService } from './dashboardService';

export const HISTORICAL_MONTHLY_DATA = [
  { month: 'Jan', monthFull: 'January 2026', issued: 48, returned: 42, overdue: 3, newMembers: 22 },
  { month: 'Feb', monthFull: 'February 2026', issued: 56, returned: 49, overdue: 4, newMembers: 28 },
  { month: 'Mar', monthFull: 'March 2026', issued: 72, returned: 65, overdue: 5, newMembers: 35 },
  { month: 'Apr', monthFull: 'April 2026', issued: 80, returned: 71, overdue: 6, newMembers: 31 },
  { month: 'May', monthFull: 'May 2026', issued: 88, returned: 82, overdue: 4, newMembers: 40 },
  { month: 'Jun', monthFull: 'June 2026', issued: 64, returned: 60, overdue: 2, newMembers: 19 },
  { month: 'Jul', monthFull: 'July 2026', issued: 70, returned: 66, overdue: 3, newMembers: 24 },
  { month: 'Aug', monthFull: 'August 2026', issued: 94, returned: 86, overdue: 5, newMembers: 38 },
  { month: 'Sep', monthFull: 'September 2026', issued: 118, returned: 104, overdue: 8, newMembers: 46 },
  { month: 'Oct', monthFull: 'October 2026', issued: 105, returned: 92, overdue: 6, newMembers: 42 },
];

export const reportService = {
  // Aggregate all live core reporting metrics
  getCoreMetrics: () => {
    const rawDash = dashboardService.getRawData();
    const books = bookService.getStoredBooks();
    const members = memberService.getStoredMembers();
    const issues = issueService.getIssues();

    // Live counts
    const liveActiveIssued = issues.filter((i) => i.status !== 'Returned').length;
    const liveReturned = issues.filter((i) => i.status === 'Returned').length;
    const liveOverdue = issues.filter((i) => i.computedStatus === 'Overdue').length;

    const totalBooks = (rawDash.totalBooks || 2850) + (books.length - 12);
    const booksIssued = Math.max(liveActiveIssued, rawDash.booksIssued || 385);
    const booksReturned = (rawDash.booksReturned || 1420) + liveReturned;
    const activeMembers = (rawDash.baseMemberCount || 340) + (members.length - 8);
    const overdueBooks = Math.max(liveOverdue, rawDash.overdueBooks || 24);

    return {
      totalBooks,
      booksIssued,
      booksReturned,
      activeMembers,
      overdueBooks,
      returnRate: parseFloat(((booksReturned / (booksIssued + booksReturned)) * 100).toFixed(1)),
    };
  },

  // Category-wise Book Count
  getCategoryWiseStats: () => {
    const categoriesWithStats = categoryService.getCategoriesWithStats();
    const books = bookService.getStoredBooks();
    const totalTitles = Math.max(1, books.length);

    return categoriesWithStats.map((cat) => {
      const percentage = parseFloat(((cat.bookCount / totalTitles) * 100).toFixed(1));
      return {
        ...cat,
        percentage,
      };
    });
  },

  // Monthly Issue Report
  getMonthlyReport: () => {
    const issues = issueService.getIssues();
    const octIssued = issues.filter((i) => i.issueDate?.startsWith('2026-10')).length;
    const octReturned = issues.filter((i) => i.returnDate?.startsWith('2026-10')).length;
    const octOverdue = issues.filter((i) => i.computedStatus === 'Overdue').length;

    return HISTORICAL_MONTHLY_DATA.map((row) => {
      if (row.month === 'Oct') {
        return {
          ...row,
          issued: row.issued + octIssued,
          returned: row.returned + octReturned,
          overdue: Math.max(row.overdue, octOverdue),
        };
      }
      return row;
    });
  },

  // Full reporting dashboard payload
  getReportData: () => {
    const coreMetrics = reportService.getCoreMetrics();
    const categoryStats = reportService.getCategoryWiseStats();
    const monthlyReport = reportService.getMonthlyReport();

    // Highest category
    const topCategory = [...categoryStats].sort((a, b) => (b.bookCount || 0) - (a.bookCount || 0))[0] || null;

    // Monthly totals
    const totalYearlyIssued = monthlyReport.reduce((acc, curr) => acc + curr.issued, 0);
    const totalYearlyReturned = monthlyReport.reduce((acc, curr) => acc + curr.returned, 0);

    return {
      metrics: coreMetrics,
      categoryStats,
      monthlyReport,
      topCategory,
      totalYearlyIssued,
      totalYearlyReturned,
    };
  },
};
