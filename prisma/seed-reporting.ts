// prisma/seed-reporting.ts
// Seed data for testing Reporting Engine

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReportingData() {
  console.log('🌱 Starting Reporting Engine seed...');

  try {
    // Get admin user (assuming exists)
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ROLE_ADMIN' },
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found, creating one...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ROLE_ADMIN',
          password: 'hashed_password', // In real scenario, use bcrypt
          isActive: true,
        },
      });
    }

    // Get departments
    const departments = await prisma.department.findMany({ take: 2 });
    const department = departments[0] || await prisma.department.create({
      data: {
        name: 'Computer Science',
        code: 'CSE',
        headId: adminUser.id,
      },
    });

    // Seed Report Templates
    console.log('📝 Creating report templates...');
    
    const templates = [
      {
        name: 'Faculty API Score Report',
        reportType: 'FACULTY_API_SCORE',
        description: 'API score calculation for faculty members',
        visibleColumns: ['name', 'email', 'department', 'totalAPIScore', 'apiCategory'],
        defaultFilters: { academicYear: '2024-2025' },
        requiredRole: 'ROLE_ADMIN',
        includeCharts: true,
        includeSignatures: false,
      },
      {
        name: 'Student Master Report',
        reportType: 'STUDENT_MASTER',
        description: 'Complete student roster with enrollment details',
        visibleColumns: ['name', 'email', 'program', 'gpa', 'enrollmentStatus'],
        defaultFilters: { academicYear: '2024-2025' },
        requiredRole: 'ROLE_ADMIN',
        includeCharts: false,
        includeSignatures: false,
      },
      {
        name: 'NBA Evidence Report',
        reportType: 'NBA_EVIDENCE',
        description: 'NBA accreditation compliance tracking',
        visibleColumns: ['criteria', 'uploadedCount', 'verifiedCount', 'pendingCount'],
        defaultFilters: { academicYear: '2024-2025' },
        requiredRole: 'ROLE_DIRECTOR',
        includeCharts: true,
        includeSignatures: true,
      },
      {
        name: 'Faculty Publication Report',
        reportType: 'FACULTY_PUBLICATION',
        description: 'Faculty publications by type and impact',
        visibleColumns: ['facultyName', 'publicationType', 'doi', 'impactFactor', 'citations'],
        defaultFilters: { academicYear: '2024-2025' },
        requiredRole: 'ROLE_HOD',
        includeCharts: true,
        includeSignatures: false,
      },
      {
        name: 'Student Risk Assessment',
        reportType: 'STUDENT_RISK_ASSESSMENT',
        description: 'Identify high-risk students needing intervention',
        visibleColumns: ['studentName', 'gpa', 'attendance', 'riskLevel', 'recommendedAction'],
        defaultFilters: { riskLevel: 'HIGH' },
        requiredRole: 'ROLE_HOD',
        includeCharts: false,
        includeSignatures: false,
      },
    ];

    for (const template of templates) {
      await prisma.reportTemplate.upsert({
        where: { reportType: template.reportType },
        update: template,
        create: template,
      });
    }
    console.log(`✅ Created ${templates.length} report templates`);

    // Seed Report History
    console.log('📊 Creating report history samples...');

    const now = new Date();
    const reports = [
      {
        reportType: 'FACULTY_API_SCORE',
        fileName: 'Faculty_API_Score_2024.pdf',
        fileSize: 250000,
        fileFormat: 'pdf',
        filePath: '/reports/Faculty_API_Score_2024.pdf',
        generatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        generatedById: adminUser.id,
        approvedById: adminUser.id,
        departmentId: department.id,
        totalRecords: 45,
        generationStatus: 'GENERATED',
        summaryData: {
          excellentCount: 12,
          veryGoodCount: 18,
          goodCount: 10,
          averageCount: 5,
          averageScore: 78.5,
        },
        compliancePercentage: 95,
        queryFilters: { academicYear: '2024-2025' },
      },
      {
        reportType: 'STUDENT_MASTER',
        fileName: 'Student_Master_2024.xlsx',
        fileSize: 150000,
        fileFormat: 'excel',
        filePath: '/reports/Student_Master_2024.xlsx',
        generatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        generatedById: adminUser.id,
        approvedById: null,
        departmentId: department.id,
        totalRecords: 320,
        generationStatus: 'GENERATED',
        summaryData: {
          totalStudents: 320,
          activeEnrollments: 280,
          onAcademicProbation: 15,
          feePending: 25,
          averageGPA: 7.2,
        },
        compliancePercentage: 88,
        queryFilters: { academicYear: '2024-2025' },
      },
      {
        reportType: 'NBA_EVIDENCE',
        fileName: 'NBA_Evidence_2024.pdf',
        fileSize: 500000,
        fileFormat: 'pdf',
        filePath: '/reports/NBA_Evidence_2024.pdf',
        generatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        generatedById: adminUser.id,
        approvedById: adminUser.id,
        departmentId: department.id,
        totalRecords: 27,
        generationStatus: 'GENERATED',
        summaryData: {
          totalCriteria: 27,
          uploadedEvidence: 25,
          verifiedEvidence: 23,
          pendingVerification: 2,
          missingEvidence: 0,
        },
        compliancePercentage: 96,
        queryFilters: { academicYear: '2024-2025' },
      },
      {
        reportType: 'FACULTY_PUBLICATION',
        fileName: 'Publications_2024.csv',
        fileSize: 50000,
        fileFormat: 'csv',
        filePath: '/reports/Publications_2024.csv',
        generatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        generatedById: adminUser.id,
        approvedById: null,
        departmentId: department.id,
        totalRecords: 89,
        generationStatus: 'GENERATED',
        summaryData: {
          totalPublications: 89,
          journalPublications: 45,
          conferencePublications: 30,
          bookChapters: 10,
          patents: 4,
          averageImpactFactor: 2.5,
        },
        compliancePercentage: 92,
        queryFilters: { academicYear: '2024-2025' },
      },
      {
        reportType: 'STUDENT_PROGRESS',
        fileName: 'Student_Progress_2024.docx',
        fileSize: 180000,
        fileFormat: 'word',
        filePath: '/reports/Student_Progress_2024.docx',
        generatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        generatedById: adminUser.id,
        approvedById: null,
        departmentId: department.id,
        totalRecords: 100,
        generationStatus: 'GENERATED',
        summaryData: {
          totalStudents: 100,
          goodStanding: 78,
          warning: 18,
          critical: 4,
          averageGPA: 7.4,
          averageAttendance: 82,
        },
        compliancePercentage: 87,
        queryFilters: { academicYear: '2024-2025', departmentId: department.id },
      },
    ];

    for (const report of reports) {
      await prisma.reportHistory.create({
        data: report,
      });
    }
    console.log(`✅ Created ${reports.length} report history entries`);

    // Seed Download Logs
    console.log('📥 Creating download audit logs...');

    const downloadLogs = [];
    for (let i = 0; i < 20; i++) {
      downloadLogs.push({
        userId: adminUser.id,
        reportType: reports[i % reports.length].reportType,
        fileFormat: ['pdf', 'excel', 'csv', 'word', 'ppt'][i % 5] as any,
        downloadedAt: new Date(now.getTime() - i * 60 * 60 * 1000),
        ipAddress: `192.168.1.${100 + i}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        deviceInfo: JSON.stringify({
          browser: 'Chrome',
          os: 'Windows 10',
          screenResolution: '1920x1080',
        }),
      });
    }

    for (const log of downloadLogs) {
      await prisma.downloadLog.create({ data: log });
    }
    console.log(`✅ Created ${downloadLogs.length} download audit logs`);

    // Seed Scheduled Reports
    console.log('⏰ Creating scheduled reports...');

    const scheduledReports = [
      {
        name: 'Weekly Faculty Report',
        description: 'Faculty API scores and publications',
        reportType: 'FACULTY_API_SCORE',
        frequency: 'WEEKLY',
        nextRunAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        lastRunAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        createdById: adminUser.id,
        isActive: true,
        recipientEmails: ['hod@example.com', 'director@example.com'],
        queryFilters: { academicYear: '2024-2025' },
      },
      {
        name: 'Monthly Student Performance Report',
        description: 'Student progress and risk assessment',
        reportType: 'STUDENT_PROGRESS',
        frequency: 'MONTHLY',
        nextRunAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        lastRunAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        createdById: adminUser.id,
        isActive: true,
        recipientEmails: ['admin@example.com', 'hod@example.com'],
        queryFilters: { academicYear: '2024-2025' },
      },
      {
        name: 'Quarterly NBA Evidence Report',
        description: 'NBA compliance tracking',
        reportType: 'NBA_EVIDENCE',
        frequency: 'QUARTERLY',
        nextRunAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        lastRunAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        createdById: adminUser.id,
        isActive: true,
        recipientEmails: ['director@example.com', 'accreditation@example.com'],
        queryFilters: { academicYear: '2024-2025' },
      },
    ];

    for (const scheduled of scheduledReports) {
      await prisma.scheduledReport.upsert({
        where: { name: scheduled.name },
        update: scheduled,
        create: scheduled,
      });
    }
    console.log(`✅ Created ${scheduledReports.length} scheduled reports`);

    // Seed Report Share Links
    console.log('🔗 Creating report share links...');

    // Get a report to share
    const reportToShare = await prisma.reportHistory.findFirst({
      where: { fileFormat: 'pdf' },
    });

    if (reportToShare) {
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const shareLink = await prisma.reportShareLink.create({
        data: {
          reportId: reportToShare.id,
          shareToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdBy: adminUser.id,
          expiresAt,
          maxDownloads: 10,
          isPasswordProtected: false,
          description: 'Shared for accreditation review',
        },
      });

      console.log(`✅ Created report share link: ${shareLink.shareToken}`);
    }

    // Seed Faculty API Scores
    console.log('📈 Creating sample Faculty API scores...');

    const faculties = await prisma.faculty.findMany({ take: 5 });
    
    for (const faculty of faculties) {
      await prisma.facultyAPIScore.upsert({
        where: { facultyId: faculty.id },
        update: {},
        create: {
          facultyId: faculty.id,
          academicYear: '2024-2025',
          teachingScore: 35,
          researchScore: 28,
          developmentScore: 15,
          contributionScore: 8,
          totalScore: 86,
          category: 'VERY_GOOD',
          generatedAt: now,
        },
      });
    }
    console.log(`✅ Created Faculty API scores for ${faculties.length} faculty`);

    console.log('✨ Reporting Engine seed completed successfully!');
    console.log('\n📊 Seed Summary:');
    console.log(`   • Report Templates: ${templates.length}`);
    console.log(`   • Report History Entries: ${reports.length}`);
    console.log(`   • Download Logs: ${downloadLogs.length}`);
    console.log(`   • Scheduled Reports: ${scheduledReports.length}`);
    console.log(`   • Report Share Links: 1`);
    console.log(`   • Faculty API Scores: ${faculties.length}`);

  } catch (error) {
    console.error('❌ Error seeding reporting data:', error);
    throw error;
  }
}

// Run seed
seedReportingData()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seedReportingData;
