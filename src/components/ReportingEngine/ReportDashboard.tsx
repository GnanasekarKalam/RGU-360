// src/components/ReportingEngine/ReportDashboard.tsx
// Main reporting dashboard component

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface Report {
  id: string;
  reportType: string;
  generatedAt: string;
  fileFormat: string;
  totalRecords: number;
  fileName: string;
  fileSize: number;
  generationStatus: string;
}

interface ReportFilters {
  reportType: string;
  departmentId?: string;
  academicYear?: string;
  format: 'pdf' | 'excel' | 'word' | 'ppt' | 'csv';
}

const REPORT_TYPES = [
  { value: 'faculty_master', label: 'Faculty Master Report' },
  { value: 'faculty_api_score', label: 'Faculty API Score Report' },
  { value: 'faculty_publication', label: 'Faculty Publication Report' },
  { value: 'faculty_fdp_seminar', label: 'Faculty FDP/Seminar Report' },
  { value: 'faculty_phd_status', label: 'Faculty PhD Status Report' },
  { value: 'faculty_task_completion', label: 'Faculty Task Completion Report' },
  { value: 'student_master', label: 'Student Master Report' },
  { value: 'student_progress', label: 'Student Progress Report' },
  { value: 'student_attendance', label: 'Student Attendance Report' },
  { value: 'student_fee_pending', label: 'Student Fee Pending Report' },
  { value: 'accreditation_nba', label: 'NBA Evidence Report' },
  { value: 'accreditation_naac', label: 'NAAC Evidence Report' },
];

export const ReportDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'faculty_master',
    format: 'pdf',
  });
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch report history on component mount
  useEffect(() => {
    fetchReportHistory();
  }, []);

  const fetchReportHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports);
      }
    } catch (err) {
      setError('Failed to fetch report history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('format', filters.format);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);

      const reportEndpoints: Record<string, string> = {
        faculty_master: '/api/reports/faculty/master',
        faculty_api_score: '/api/reports/faculty/api-score',
        faculty_publication: '/api/reports/faculty/publications',
        faculty_fdp_seminar: '/api/reports/faculty/fdp-seminar',
        student_master: '/api/reports/student/master',
        student_progress: '/api/reports/student/progress',
        student_attendance: '/api/reports/student/attendance',
        student_fee_pending: '/api/reports/student/fee-pending',
        accreditation_nba: '/api/reports/accreditation/nba',
      };

      const endpoint = reportEndpoints[filters.reportType];
      if (!endpoint) {
        setError('Invalid report type');
        return;
      }

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].split('"')[1]
        : `report.${filters.format}`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      setSuccess('Report generated and downloaded successfully');
      setOpenGenerateDialog(false);
      await fetchReportHistory();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const response = await fetch(`/api/reports/history/${report.id}/download?format=${report.fileFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName;
      link.click();
      window.URL.revokeObjectURL(url);

      setSuccess('Report downloaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
      console.error(err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const response = await fetch(`/api/reports/history/${reportId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setSuccess('Report deleted successfully');
          await fetchReportHistory();
        }
      } catch (err) {
        setError('Failed to delete report');
        console.error(err);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Reporting Engine</h1>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={() => setOpenGenerateDialog(true)}
        >
          Generate Report
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Recent Reports" />
          <Tab label="Report Templates" />
          <Tab label="Download History" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {loading ? (
            <CircularProgress />
          ) : reports.length === 0 ? (
            <Alert severity="info">No reports generated yet. Click "Generate Report" to create one.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Report Name</TableCell>
                    <TableCell align="right">Records</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Generated</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reportType}</TableCell>
                      <TableCell align="right">{report.totalRecords}</TableCell>
                      <TableCell>
                        <Chip label={report.fileFormat} size="small" />
                      </TableCell>
                      <TableCell>{report.fileSize ? formatFileSize(report.fileSize) : 'N/A'}</TableCell>
                      <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.generationStatus}
                          color={report.generationStatus === 'GENERATED' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteReport(report.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Grid container spacing={2}>
          {REPORT_TYPES.map(reportType => (
            <Grid item xs={12} sm={6} md={4} key={reportType.value}>
              <Card>
                <CardHeader title={reportType.label} />
                <CardContent>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setFilters({ ...filters, reportType: reportType.value });
                      setOpenGenerateDialog(true);
                    }}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Alert severity="info">Download history tracking is available for administrators.</Alert>
      )}

      {/* Generate Report Dialog */}
      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Select
              value={filters.reportType}
              onChange={e => setFilters({ ...filters, reportType: e.target.value })}
              label="Report Type"
            >
              {REPORT_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Academic Year"
              value={filters.academicYear || ''}
              onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
              placeholder="2024-2025"
            />

            <Select
              value={filters.format}
              onChange={e => setFilters({ ...filters, format: e.target.value as any })}
              label="Export Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="word">Word</MenuItem>
              <MenuItem value="ppt">PowerPoint</MenuItem>
            </Select>

            {generating && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate & Download'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportDashboard;
