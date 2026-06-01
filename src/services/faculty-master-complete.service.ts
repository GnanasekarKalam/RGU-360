// src/services/faculty-master-complete.service.ts
// Faculty Master Module Service - Complete Implementation

import { PrismaClient } from '@prisma/client';
import {
  FacultyProfile,
  FacultyQualification,
  FacultyPublication,
  FacultyFDP,
  FacultySeminar,
  FacultyPhd,
  FacultySkill,
  FacultyEvidence,
  CreateQualificationRequest,
  CreatePublicationRequest,
  CreateFDPRequest,
  CreateSeminarRequest,
  CreatePhdRequest,
  UpdatePhdRequest,
  CreateSkillRequest,
  CreateEvidenceRequest,
  FacultyDashboardResponse,
} from '../types/faculty-master.types';

const prisma = new PrismaClient();

// ============================================================================
// QUALIFICATIONS MANAGEMENT
// ============================================================================

export const addQualification = async (
  facultyId: string,
  data: CreateQualificationRequest
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const qualification = await prisma.facultyQualification.create({
      data: {
        facultyId,
        degreeType: data.degreeType,
        specialization: data.specialization,
        university: data.university,
        yearOfPassing: data.yearOfPassing,
        gradePercentage: data.gradePercentage,
        certificateUrl: data.certificateUrl,
      },
    });

    return {
      success: true,
      message: 'Qualification added successfully',
      qualification,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getQualifications = async (facultyId: string) => {
  try {
    const qualifications = await prisma.facultyQualification.findMany({
      where: { facultyId },
      orderBy: { yearOfPassing: 'desc' },
    });

    return { success: true, qualifications };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateQualification = async (
  qualificationId: string,
  data: Partial<CreateQualificationRequest>
) => {
  try {
    const qualification = await prisma.facultyQualification.update({
      where: { id: qualificationId },
      data,
    });

    return {
      success: true,
      message: 'Qualification updated successfully',
      qualification,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const deleteQualification = async (qualificationId: string) => {
  try {
    await prisma.facultyQualification.delete({
      where: { id: qualificationId },
    });

    return { success: true, message: 'Qualification deleted successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// PUBLICATIONS MANAGEMENT
// ============================================================================

export const addPublication = async (
  facultyId: string,
  data: CreatePublicationRequest
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const publication = await prisma.facultyPublication.create({
      data: {
        facultyId,
        title: data.title,
        authors: data.authors,
        publicationType: data.publicationType,
        journalName: data.journalName,
        journalVolume: data.journalVolume,
        journalIssue: data.journalIssue,
        pageNumbers: data.pageNumbers,
        publicationYear: data.publicationYear,
        doi: data.doi,
        impact: data.impact,
        link: data.link,
        documentUrl: data.documentUrl,
      },
    });

    return {
      success: true,
      message: 'Publication added successfully',
      publication,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getPublications = async (facultyId: string) => {
  try {
    const publications = await prisma.facultyPublication.findMany({
      where: { facultyId },
      orderBy: { publicationYear: 'desc' },
    });

    return { success: true, publications };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updatePublicationCitations = async (
  publicationId: string,
  citationCount: number
) => {
  try {
    const publication = await prisma.facultyPublication.update({
      where: { id: publicationId },
      data: { citationCount },
    });

    return {
      success: true,
      message: 'Citation count updated',
      publication,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// FDP PROGRAMS MANAGEMENT
// ============================================================================

export const addFDPProgram = async (
  facultyId: string,
  data: CreateFDPRequest
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const fdpProgram = await prisma.facultyFDP.create({
      data: {
        facultyId,
        programName: data.programName,
        organizingInstitute: data.organizingInstitute,
        startDate,
        endDate,
        duration,
        level: data.level,
        fieldOfStudy: data.fieldOfStudy,
        certificateUrl: data.certificateUrl,
        certificateNumber: data.certificateNumber,
      },
    });

    return {
      success: true,
      message: 'FDP program added successfully',
      fdpProgram,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getFDPPrograms = async (facultyId: string) => {
  try {
    const fdpPrograms = await prisma.facultyFDP.findMany({
      where: { facultyId },
      orderBy: { startDate: 'desc' },
    });

    return { success: true, fdpPrograms };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// SEMINARS MANAGEMENT
// ============================================================================

export const addSeminar = async (
  facultyId: string,
  data: CreateSeminarRequest
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const seminar = await prisma.facultySeminar.create({
      data: {
        facultyId,
        seminarTitle: data.seminarTitle,
        organizingBody: data.organizingBody,
        venue: data.venue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        role: data.role,
        description: data.description,
        certificateUrl: data.certificateUrl,
        certificateNumber: data.certificateNumber,
      },
    });

    return {
      success: true,
      message: 'Seminar added successfully',
      seminar,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getSeminars = async (facultyId: string) => {
  try {
    const seminars = await prisma.facultySeminar.findMany({
      where: { facultyId },
      orderBy: { startDate: 'desc' },
    });

    return { success: true, seminars };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// PhD TRACKING MANAGEMENT
// ============================================================================

export const addPhdCandidate = async (
  facultyId: string,
  data: CreatePhdRequest
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const phd = await prisma.facultyPhd.create({
      data: {
        facultyId,
        studentName: data.studentName,
        enrollmentNumber: data.enrollmentNumber,
        researchTopic: data.researchTopic,
        supervisorName: data.supervisorName,
        coDoctorName: data.coDoctorName,
        enrollmentDate: new Date(data.enrollmentDate),
        expectedCompletionDate: new Date(data.expectedCompletionDate),
      },
    });

    return {
      success: true,
      message: 'PhD candidate added successfully',
      phd,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getPhdCandidates = async (facultyId: string) => {
  try {
    const candidates = await prisma.facultyPhd.findMany({
      where: { facultyId },
      orderBy: { enrollmentDate: 'desc' },
    });

    const stats = {
      total: candidates.length,
      completed: candidates.filter((c) => c.status === 'COMPLETED').length,
      inProgress: candidates.filter(
        (c) => c.status === 'PROGRESS' || c.status === 'THESIS_SUBMITTED'
      ).length,
      withdrawn: candidates.filter((c) => c.status === 'WITHDRAWN').length,
    };

    return { success: true, candidates, stats };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updatePhdProgress = async (
  phdId: string,
  data: UpdatePhdRequest
) => {
  try {
    const phd = await prisma.facultyPhd.update({
      where: { id: phdId },
      data,
    });

    return {
      success: true,
      message: 'PhD progress updated successfully',
      phd,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// SKILLS MANAGEMENT
// ============================================================================

export const addSkill = async (facultyId: string, data: CreateSkillRequest) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const skill = await prisma.facultySkill.create({
      data: {
        facultyId,
        skillName: data.skillName,
        skillCategory: data.skillCategory,
        proficiencyLevel: data.proficiencyLevel,
        yearsOfExperience: data.yearsOfExperience,
        certificateUrl: data.certificateUrl,
      },
    });

    return {
      success: true,
      message: 'Skill added successfully',
      skill,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getSkills = async (facultyId: string) => {
  try {
    const skills = await prisma.facultySkill.findMany({
      where: { facultyId },
      orderBy: [{ proficiencyLevel: 'desc' }, { endorsements: 'desc' }],
    });

    return { success: true, skills };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const endorseSkill = async (skillId: string) => {
  try {
    const skill = await prisma.facultySkill.update({
      where: { id: skillId },
      data: {
        endorsements: { increment: 1 },
        lastEndorsedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Skill endorsed successfully',
      skill,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// EVIDENCE MANAGEMENT
// ============================================================================

export const addEvidence = async (
  facultyId: string,
  data: CreateEvidenceRequest
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const evidence = await prisma.facultyEvidence.create({
      data: {
        facultyId,
        title: data.title,
        description: data.description,
        evidenceType: data.evidenceType,
        documentUrl: data.documentUrl,
        imageUrl: data.imageUrl,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        verificationNumber: data.verificationNumber,
        issuingAuthority: data.issuingAuthority,
      },
    });

    return {
      success: true,
      message: 'Evidence added successfully',
      evidence,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getEvidence = async (facultyId: string) => {
  try {
    const evidence = await prisma.facultyEvidence.findMany({
      where: { facultyId },
      orderBy: { issueDate: 'desc' },
    });

    return { success: true, evidence };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const verifyEvidence = async (
  evidenceId: string,
  verifiedBy: string,
  status: 'VERIFIED' | 'REJECTED'
) => {
  try {
    const evidence = await prisma.facultyEvidence.update({
      where: { id: evidenceId },
      data: {
        status,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Evidence ${status.toLowerCase()} successfully`,
      evidence,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// FACULTY DASHBOARD
// ============================================================================

export const getFacultyDashboard = async (
  facultyId: string
): Promise<FacultyDashboardResponse | any> => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
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
        department: {
          select: { id: true, name: true },
        },
      },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    const [
      qualifications,
      publications,
      fdpPrograms,
      seminars,
      phdCandidates,
      skills,
      evidence,
    ] = await Promise.all([
      prisma.facultyQualification.findMany({ where: { facultyId } }),
      prisma.facultyPublication.findMany({ where: { facultyId } }),
      prisma.facultyFDP.findMany({ where: { facultyId } }),
      prisma.facultySeminar.findMany({ where: { facultyId } }),
      prisma.facultyPhd.findMany({ where: { facultyId } }),
      prisma.facultySkill.findMany({ where: { facultyId } }),
      prisma.facultyEvidence.findMany({ where: { facultyId } }),
    ]);

    const profile: FacultyProfile = {
      id: faculty.id,
      userId: faculty.userId,
      employeeId: faculty.employeeId,
      firstName: faculty.user.firstName,
      lastName: faculty.user.lastName,
      email: faculty.user.email,
      departmentId: faculty.departmentId,
      departmentName: faculty.department.name,
      title: faculty.title || '',
      specialization: faculty.specialization || '',
      academicDegree: faculty.academicDegree || '',
      degreeInstitution: faculty.degreeInstitution || '',
      employmentStatus: faculty.employmentStatus as any,
      hireDate: faculty.hireDate || new Date(),
      tenureStatus: faculty.tenureStatus as any,
      officeLocation: faculty.officeLocation || '',
      officePhone: faculty.officePhone || '',
      officeHours: faculty.officeHours || '',
      performanceRating: faculty.performanceRating
        ? parseFloat(faculty.performanceRating.toString())
        : 0,
      teachingEffectivenessScore: faculty.teachingEffectivenessScore
        ? parseFloat(faculty.teachingEffectivenessScore.toString())
        : 0,
      isActive: faculty.isActive,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    };

    return {
      success: true,
      dashboard: {
        profile,
        qualifications,
        publications,
        fdpPrograms,
        seminars,
        phdCandidates,
        skills,
        evidence,
        stats: {
          totalPublications: publications.length,
          totalFDPPrograms: fdpPrograms.length,
          totalSeminars: seminars.length,
          totalPhdCandidates: phdCandidates.length,
          completedPhds: phdCandidates.filter((p) => p.status === 'COMPLETED')
            .length,
          totalSkills: skills.length,
          totalEvidenceItems: evidence.length,
        },
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
