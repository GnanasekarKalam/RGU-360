// src/services/student-master.service.ts
// Student Master Module Service

import { PrismaClient } from '@prisma/client';
import {
  CreateParentRequest,
  UpdateParentRequest,
  CreateAcademicRecordRequest,
  CreateFeeRequest,
  RecordFeePaymentRequest,
  AssignTutorWardRequest,
  UpdateTutorWardRequest,
  StudentDashboardResponse,
  StudentFeeSummary,
} from '../types/student-master.types';

const prisma = new PrismaClient();

// ============================================================================
// STUDENT PROFILE
// ============================================================================

export const getStudentProfile = async (studentId: string) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            phoneNumber: true,
            mobileNumber: true,
          },
        },
        primaryAdvisor: {
          select: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    return {
      success: true,
      student: {
        ...student,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        primaryAdvisorName: student.primaryAdvisor
          ? `${student.primaryAdvisor.user.firstName} ${student.primaryAdvisor.user.lastName}`
          : null,
      },
    };
  } catch (error: any) {
    console.error('Get student profile error:', error);
    return { success: false, message: 'Failed to get student profile' };
  }
};

export const updateStudentProfile = async (studentId: string, data: any) => {
  try {
    const updated = await prisma.student.update({
      where: { id: studentId },
      data,
      include: { user: true, primaryAdvisor: true },
    });

    return {
      success: true,
      message: 'Student profile updated successfully',
      student: updated,
    };
  } catch (error: any) {
    console.error('Update student profile error:', error);
    return { success: false, message: 'Failed to update student profile' };
  }
};

// ============================================================================
// PARENT DETAILS
// ============================================================================

export const addParent = async (studentId: string, data: CreateParentRequest) => {
  try {
    const parent = await prisma.studentParent.create({
      data: {
        studentId,
        ...data,
      },
    });

    return {
      success: true,
      message: 'Parent added successfully',
      parent,
    };
  } catch (error: any) {
    console.error('Add parent error:', error);
    return { success: false, message: 'Failed to add parent' };
  }
};

export const getParents = async (studentId: string) => {
  try {
    const parents = await prisma.studentParent.findMany({
      where: { studentId },
      orderBy: { relationship: 'asc' },
    });

    return { success: true, parents };
  } catch (error: any) {
    console.error('Get parents error:', error);
    return { success: false, message: 'Failed to get parents' };
  }
};

export const updateParent = async (parentId: string, data: UpdateParentRequest) => {
  try {
    const updated = await prisma.studentParent.update({
      where: { id: parentId },
      data,
    });

    return {
      success: true,
      message: 'Parent updated successfully',
      parent: updated,
    };
  } catch (error: any) {
    console.error('Update parent error:', error);
    return { success: false, message: 'Failed to update parent' };
  }
};

export const deleteParent = async (parentId: string) => {
  try {
    await prisma.studentParent.delete({
      where: { id: parentId },
    });

    return { success: true, message: 'Parent deleted successfully' };
  } catch (error: any) {
    console.error('Delete parent error:', error);
    return { success: false, message: 'Failed to delete parent' };
  }
};

// ============================================================================
// ACADEMIC RECORDS
// ============================================================================

export const createAcademicRecord = async (
  studentId: string,
  data: CreateAcademicRecordRequest
) => {
  try {
    const record = await prisma.studentAcademicRecord.create({
      data: {
        studentId,
        ...data,
      },
    });

    // Update student's cumulative GPA
    if (data.semesterGpa) {
      const records = await prisma.studentAcademicRecord.findMany({
        where: { studentId },
      });

      const avgGpa =
        records.reduce((sum: number, r: any) => sum + (r.semesterGpa || 0), 0) / records.length;

      await prisma.student.update({
        where: { id: studentId },
        data: { cumulativeGpa: avgGpa },
      });
    }

    return {
      success: true,
      message: 'Academic record created successfully',
      record,
    };
  } catch (error: any) {
    console.error('Create academic record error:', error);
    return { success: false, message: 'Failed to create academic record' };
  }
};

export const getAcademicRecords = async (studentId: string) => {
  try {
    const records = await prisma.studentAcademicRecord.findMany({
      where: { studentId },
      orderBy: { academicYear: 'desc' },
    });

    return { success: true, records };
  } catch (error: any) {
    console.error('Get academic records error:', error);
    return { success: false, message: 'Failed to get academic records' };
  }
};

export const deleteAcademicRecord = async (recordId: string) => {
  try {
    await prisma.studentAcademicRecord.delete({
      where: { id: recordId },
    });

    return { success: true, message: 'Academic record deleted successfully' };
  } catch (error: any) {
    console.error('Delete academic record error:', error);
    return { success: false, message: 'Failed to delete academic record' };
  }
};

// ============================================================================
// FEES
// ============================================================================

export const createFee = async (studentId: string, data: CreateFeeRequest) => {
  try {
    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        paidAmount: 0,
        balance: data.totalFeeAmount,
        paymentStatus: 'PENDING',
        installmentsPaid: 0,
        ...data,
      },
    });

    return {
      success: true,
      message: 'Fee created successfully',
      fee,
    };
  } catch (error: any) {
    console.error('Create fee error:', error);
    return { success: false, message: 'Failed to create fee' };
  }
};

export const getFees = async (studentId: string) => {
  try {
    const fees = await prisma.studentFee.findMany({
      where: { studentId },
      orderBy: { dueDate: 'asc' },
    });

    return { success: true, fees };
  } catch (error: any) {
    console.error('Get fees error:', error);
    return { success: false, message: 'Failed to get fees' };
  }
};

export const recordFeePayment = async (feeId: string, data: RecordFeePaymentRequest) => {
  try {
    const fee = await prisma.studentFee.findUnique({
      where: { id: feeId },
    });

    if (!fee) {
      return { success: false, message: 'Fee not found' };
    }

    const newPaidAmount = fee.paidAmount + data.paidAmount;
    const newBalance = fee.totalFeeAmount - newPaidAmount;
    let newStatus = fee.paymentStatus;

    if (newBalance === 0) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL_PAID';
    }

    const updated = await prisma.studentFee.update({
      where: { id: feeId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        paymentStatus: newStatus,
        lastPaymentDate: data.paymentDate,
        lastPaymentAmount: data.paidAmount,
        installmentsPaid: fee.installmentsPaid + 1,
      },
    });

    return {
      success: true,
      message: 'Fee payment recorded successfully',
      fee: updated,
    };
  } catch (error: any) {
    console.error('Record fee payment error:', error);
    return { success: false, message: 'Failed to record fee payment' };
  }
};

export const getFeeSummary = async (
  studentId: string,
  semester: string,
  academicYear: string
): Promise<StudentFeeSummary | any> => {
  try {
    const fees = await prisma.studentFee.findMany({
      where: {
        studentId,
        semester,
        academicYear,
      },
    });

    const totalFeesDue = fees.reduce((sum: number, f: any) => sum + f.totalFeeAmount, 0);
    const totalFeesPaid = fees.reduce((sum: number, f: any) => sum + f.paidAmount, 0);
    const remainingBalance = fees.reduce((sum: number, f: any) => sum + f.balance, 0);

    return {
      success: true,
      summary: {
        studentId,
        semester,
        academicYear,
        totalFeesDue,
        totalFeesPaid,
        remainingBalance,
        categories: fees,
      },
    };
  } catch (error: any) {
    console.error('Get fee summary error:', error);
    return { success: false, message: 'Failed to get fee summary' };
  }
};

// ============================================================================
// TUTOR WARD ASSIGNMENT
// ============================================================================

export const assignTutorWard = async (
  studentId: string,
  data: AssignTutorWardRequest
) => {
  try {
    // Check if student already has active tutor
    const existing = await prisma.studentTutorWard.findFirst({
      where: {
        studentId,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      // Terminate existing assignment
      await prisma.studentTutorWard.update({
        where: { id: existing.id },
        data: { status: 'COMPLETED', endDate: new Date() },
      });
    }

    const assignment = await prisma.studentTutorWard.create({
      data: {
        studentId,
        assignmentDate: new Date(),
        status: 'ACTIVE',
        isActive: true,
        ...data,
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: 'Tutor assigned successfully',
      assignment,
    };
  } catch (error: any) {
    console.error('Assign tutor error:', error);
    return { success: false, message: 'Failed to assign tutor' };
  }
};

export const getTutorWard = async (studentId: string) => {
  try {
    const assignment = await prisma.studentTutorWard.findFirst({
      where: {
        studentId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return { success: true, assignment: null };
    }

    return { success: true, assignment };
  } catch (error: any) {
    console.error('Get tutor ward error:', error);
    return { success: false, message: 'Failed to get tutor assignment' };
  }
};

export const updateTutorWard = async (assignmentId: string, data: UpdateTutorWardRequest) => {
  try {
    const updated = await prisma.studentTutorWard.update({
      where: { id: assignmentId },
      data,
      include: { tutor: true },
    });

    return {
      success: true,
      message: 'Tutor ward assignment updated successfully',
      assignment: updated,
    };
  } catch (error: any) {
    console.error('Update tutor ward error:', error);
    return { success: false, message: 'Failed to update tutor assignment' };
  }
};

export const terminateTutorWard = async (assignmentId: string) => {
  try {
    await prisma.studentTutorWard.update({
      where: { id: assignmentId },
      data: {
        status: 'TERMINATED',
        endDate: new Date(),
        isActive: false,
      },
    });

    return { success: true, message: 'Tutor assignment terminated successfully' };
  } catch (error: any) {
    console.error('Terminate tutor ward error:', error);
    return { success: false, message: 'Failed to terminate tutor assignment' };
  }
};

// ============================================================================
// STUDENT DASHBOARD
// ============================================================================

export const getStudentDashboard = async (studentId: string) => {
  try {
    const profile = await getStudentProfile(studentId);
    const { parents } = await getParents(studentId);
    const { records: academicRecords } = await getAcademicRecords(studentId);
    const { fees } = await getFees(studentId);
    const { assignment: tutorWard } = await getTutorWard(studentId);

    const totalFeesDue = fees?.reduce((sum: number, f: any) => sum + f.totalFeeAmount, 0) || 0;
    const totalFeesPaid = fees?.reduce((sum: number, f: any) => sum + f.paidAmount, 0) || 0;
    const pendingFees = fees?.reduce((sum: number, f: any) => sum + f.balance, 0) || 0;

    return {
      success: true,
      dashboard: {
        profile: profile.student,
        parents: parents || [],
        academicRecords: academicRecords || [],
        fees: fees || [],
        tutorWard: tutorWard || null,
        stats: {
          totalParents: parents?.length || 0,
          currentGpa: profile.student?.currentGpa || 0,
          creditsEarned: profile.student?.creditsEarned || 0,
          creditsRequired: profile.student?.creditsRequired || 0,
          totalFeesDue,
          totalFeesPaid,
          pendingFees,
          academicStanding: profile.student?.academicStanding || 'GOOD',
          tutorAssigned: !!tutorWard,
        },
      },
    };
  } catch (error: any) {
    console.error('Get student dashboard error:', error);
    return { success: false, message: 'Failed to get student dashboard' };
  }
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const getTuteesList = async (tutorId: string) => {
  try {
    const tutees = await prisma.studentTutorWard.findMany({
      where: {
        tutorId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { assignmentDate: 'desc' },
    });

    return { success: true, tutees };
  } catch (error: any) {
    console.error('Get tutees list error:', error);
    return { success: false, message: 'Failed to get tutees list' };
  }
};
