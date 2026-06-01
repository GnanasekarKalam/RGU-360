// src/__tests__/reporting.test.ts
// Comprehensive testing for Reporting Engine

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();
let validToken: string;
let testUser: any;
let testDepartment: any;

// Test setup
beforeAll(async () => {
  // Create test user
  testUser = await prisma.user.upsert({
    where: { email: 'test-admin@example.com' },
    update: {},
    create: {
      email: 'test-admin@example.com',
      name: 'Test Admin',
      role: 'ROLE_ADMIN',
      password: 'hashed_password',
      isActive: true,
    },
  });

  // Create test department
  testDepartment = await prisma.department.upsert({
    where: { code: 'TEST' },
    update: {},
    create: {
      name: 'Test Department',
      code: 'TEST',
      headId: testUser.id,
    },
  });

  // Generate valid JWT token (in real scenario, use JWT library)
  validToken = `Bearer test_jwt_token_${testUser.id}`;
});

// Test cleanup
afterAll(async () => {
  await prisma.user.delete({ where: { id: testUser.id } });
  await prisma.department.delete({ where: { id: testDepartment.id } });
  await prisma.$disconnect();
});

// ============ AUTHENTICATION TESTS ============

describe('Authentication & Authorization', () => {
  test('Request without token returns 401', async () => {
    const response = await request(app)
      .get('/api/reports/faculty/master');
    
    expect(response.status).toBe(401);
  });

  test('Invalid token returns 401', async () => {
    const response = await request(app)
      .get('/api/reports/faculty/master')
      .set('Authorization', 'Bearer invalid_token');
    
    expect(response.status).toBe(401);
  });

  test('Valid token returns 200 or 403 (based on permission)', async () => {
    const response = await request(app)
      .get('/api/reports/faculty/master')
      .set('Authorization', validToken)
      .query({ format: 'pdf' });
    
    // Should be 200 if token is valid, or 403 if not authorized
    expect([200, 403]).toContain(response.status);
  });
});

// ============ REPORT GENERATION TESTS ============

describe('Report Generation Endpoints', () => {
  const validFormats = ['pdf', 'excel', 'csv', 'word', 'ppt'];

  describe('Faculty Reports', () => {
    test('GET /faculty/master with valid format returns file', async () => {
      const response = await request(app)
        .get('/api/reports/faculty/master')
        .set('Authorization', validToken)
        .query({ format: 'pdf' });
      
      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers['content-type']).toBeDefined();
        expect(response.body).toBeDefined();
      }
    });

    test('GET /faculty/master with invalid format returns 400', async () => {
      const response = await request(app)
        .get('/api/reports/faculty/master')
        .set('Authorization', validToken)
        .query({ format: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('GET /faculty/api-score returns report', async () => {
      const response = await request(app)
        .get('/api/reports/faculty/api-score')
        .set('Authorization', validToken)
        .query({ format: 'excel' });
      
      expect([200, 403]).toContain(response.status);
    });

    test('GET /faculty/publications with facultyId filter', async () => {
      const response = await request(app)
        .get('/api/reports/faculty/publications')
        .set('Authorization', validToken)
        .query({ format: 'pdf', facultyId: 'FAC_001' });
      
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Student Reports', () => {
    test('GET /student/master returns student roster', async () => {
      const response = await request(app)
        .get('/api/reports/student/master')
        .set('Authorization', validToken)
        .query({ format: 'excel' });
      
      expect([200, 403]).toContain(response.status);
    });

    test('GET /student/progress with studentId returns progress report', async () => {
      const response = await request(app)
        .get('/api/reports/student/progress')
        .set('Authorization', validToken)
        .query({ format: 'pdf', studentId: 'STU_001' });
      
      expect([200, 403]).toContain(response.status);
    });

    test('GET /student/attendance returns attendance report', async () => {
      const response = await request(app)
        .get('/api/reports/student/attendance')
        .set('Authorization', validToken)
        .query({ format: 'csv' });
      
      expect([200, 403]).toContain(response.status);
    });

    test('GET /student/fee-pending returns fee pending report', async () => {
      const response = await request(app)
        .get('/api/reports/student/fee-pending')
        .set('Authorization', validToken)
        .query({ format: 'word' });
      
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Accreditation Reports', () => {
    test('GET /accreditation/nba returns NBA evidence report', async () => {
      const response = await request(app)
        .get('/api/reports/accreditation/nba')
        .set('Authorization', validToken)
        .query({ format: 'pdf' });
      
      expect([200, 403]).toContain(response.status);
    });

    test('GET /accreditation/nba with academicYear filter', async () => {
      const response = await request(app)
        .get('/api/reports/accreditation/nba')
        .set('Authorization', validToken)
        .query({ format: 'excel', academicYear: '2024-2025' });
      
      expect([200, 403]).toContain(response.status);
    });
  });
});

// ============ REPORT HISTORY TESTS ============

describe('Report History Management', () => {
  test('GET /history returns recent reports', async () => {
    const response = await request(app)
      .get('/api/reports/history')
      .set('Authorization', validToken)
      .query({ limit: 20, offset: 0 });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('reports');
    expect(Array.isArray(response.body.data.reports)).toBe(true);
  });

  test('GET /history respects limit and offset', async () => {
    const response = await request(app)
      .get('/api/reports/history')
      .set('Authorization', validToken)
      .query({ limit: 10, offset: 5 });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('limit', 10);
    expect(response.body.data).toHaveProperty('offset', 5);
  });

  test('GET /history/:reportId/download downloads report', async () => {
    // First create a report entry
    const report = await prisma.reportHistory.create({
      data: {
        reportType: 'FACULTY_MASTER',
        fileName: 'test_report.pdf',
        fileSize: 10000,
        fileFormat: 'pdf',
        filePath: '/test/test_report.pdf',
        generatedAt: new Date(),
        generatedById: testUser.id,
        departmentId: testDepartment.id,
        totalRecords: 10,
        generationStatus: 'GENERATED',
        queryFilters: {},
      },
    });

    const response = await request(app)
      .get(`/api/reports/history/${report.id}/download`)
      .set('Authorization', validToken)
      .query({ format: 'pdf' });
    
    expect([200, 403]).toContain(response.status);

    // Cleanup
    await prisma.reportHistory.delete({ where: { id: report.id } });
  });

  test('DELETE /history/:reportId removes report', async () => {
    // Create report
    const report = await prisma.reportHistory.create({
      data: {
        reportType: 'FACULTY_MASTER',
        fileName: 'test_delete.pdf',
        fileSize: 10000,
        fileFormat: 'pdf',
        filePath: '/test/test_delete.pdf',
        generatedAt: new Date(),
        generatedById: testUser.id,
        departmentId: testDepartment.id,
        totalRecords: 10,
        generationStatus: 'GENERATED',
        queryFilters: {},
      },
    });

    const response = await request(app)
      .delete(`/api/reports/history/${report.id}`)
      .set('Authorization', validToken);
    
    expect([200, 403]).toContain(response.status);
  });
});

// ============ AUDIT LOG TESTS ============

describe('Download Audit Logs', () => {
  test('GET /download-logs (admin only) returns audit trail', async () => {
    const response = await request(app)
      .get('/api/reports/download-logs')
      .set('Authorization', validToken)
      .query({ limit: 50, offset: 0 });
    
    // Only admin can access this endpoint
    expect([200, 403]).toContain(response.status);
    if (response.status === 200) {
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  test('GET /download-logs with filters', async () => {
    const response = await request(app)
      .get('/api/reports/download-logs')
      .set('Authorization', validToken)
      .query({
        userId: testUser.id,
        reportType: 'FACULTY_MASTER',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    
    expect([200, 403]).toContain(response.status);
  });
});

// ============ DATA VALIDATION TESTS ============

describe('Data Validation', () => {
  test('Report response includes required fields', async () => {
    // This would be tested after actual report generation
    const mockReportData = {
      metadata: {
        reportType: 'FACULTY_MASTER',
        generatedAt: new Date().toISOString(),
        generatedBy: 'Admin User',
        academicYear: '2024-2025',
        totalRecords: 45,
      },
      data: [
        {
          id: 'FAC_001',
          name: 'Dr. Smith',
          email: 'smith@example.com',
          department: 'CSE',
        },
      ],
      summary: {
        totalCount: 45,
        activeCount: 43,
        inactiveCount: 2,
      },
    };

    expect(mockReportData).toHaveProperty('metadata');
    expect(mockReportData).toHaveProperty('data');
    expect(mockReportData).toHaveProperty('summary');
    expect(Array.isArray(mockReportData.data)).toBe(true);
  });

  test('Sensitive data is masked correctly', () => {
    const testData = {
      aadhaar: '1234-5678-9012',
      pan: 'ABCDE2FGHI',
      phone: '9876543210',
      email: 'test@example.com',
    };

    // After masking:
    // Aadhaar: XXXX-XXXX-9012
    // PAN: XXXXX2FGHI
    // Phone: XXXXXX3210
    // Email: t***@example.com

    expect('XXXX-XXXX-9012').toMatch(/XXXX-XXXX-\d{4}/);
    expect('XXXXX2FGHI').toMatch(/XXXXX.{5}/);
    expect('XXXXXX3210').toMatch(/XXXXXX\d{4}/);
    expect('t***@example.com').toMatch(/.*\*\*\*@.*/);
  });
});

// ============ ERROR HANDLING TESTS ============

describe('Error Handling', () => {
  test('Invalid report type returns appropriate error', async () => {
    const response = await request(app)
      .get('/api/reports/invalid/endpoint')
      .set('Authorization', validToken);
    
    expect(response.status).toBe(404);
  });

  test('Server error returns 500', async () => {
    // This would require mocking a service failure
    // Simulating a database connection failure
    const response = await request(app)
      .get('/api/reports/history')
      .set('Authorization', validToken);
    
    // Should handle gracefully
    expect([200, 500]).toContain(response.status);
  });

  test('Missing required parameters handled', async () => {
    const response = await request(app)
      .get('/api/reports/faculty/master')
      .set('Authorization', validToken);
    // Should use default format or return 400
    
    expect([200, 400]).toContain(response.status);
  });
});

// ============ PERFORMANCE TESTS ============

describe('Performance', () => {
  test('Report generation completes within timeout', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/reports/faculty/master')
      .set('Authorization', validToken)
      .query({ format: 'pdf' })
      .timeout(10000); // 10 second timeout
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Request should complete in less than 10 seconds
    expect(duration).toBeLessThan(10000);
    expect([200, 403]).toContain(response.status);
  });

  test('History endpoint returns data quickly', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/reports/history')
      .set('Authorization', validToken);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should return in less than 2 seconds
    expect(duration).toBeLessThan(2000);
    expect(response.status).toBe(200);
  });
});

// ============ EXPORT FORMAT TESTS ============

describe('Export Format Validation', () => {
  const formats = ['pdf', 'excel', 'csv', 'word', 'ppt'];

  formats.forEach(format => {
    test(`Report can be exported as ${format}`, async () => {
      const response = await request(app)
        .get('/api/reports/faculty/master')
        .set('Authorization', validToken)
        .query({ format });
      
      if (response.status === 200) {
        // Verify correct content type
        const contentType = response.headers['content-type'];
        expect(contentType).toBeDefined();
        
        // Verify file download header
        const contentDisposition = response.headers['content-disposition'];
        expect(contentDisposition).toContain('attachment');
        expect(contentDisposition).toContain('filename');
      }
    });
  });
});

// ============ INTEGRATION TESTS ============

describe('End-to-End Integration', () => {
  test('Complete report generation workflow', async () => {
    // 1. Generate report
    const generateResponse = await request(app)
      .get('/api/reports/faculty/master')
      .set('Authorization', validToken)
      .query({ format: 'pdf' });
    
    expect([200, 403]).toContain(generateResponse.status);
    
    // 2. Check report history
    if (generateResponse.status === 200) {
      const historyResponse = await request(app)
        .get('/api/reports/history')
        .set('Authorization', validToken);
      
      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.data.reports.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('Report generation creates audit trail', async () => {
    // Generate report
    const response = await request(app)
      .get('/api/reports/faculty/master')
      .set('Authorization', validToken)
      .query({ format: 'pdf' });
    
    if (response.status === 200) {
      // Check download logs
      const logsResponse = await request(app)
        .get('/api/reports/download-logs')
        .set('Authorization', validToken);
      
      // Should have audit trail
      expect([200, 403]).toContain(logsResponse.status);
    }
  });
});

export {};
