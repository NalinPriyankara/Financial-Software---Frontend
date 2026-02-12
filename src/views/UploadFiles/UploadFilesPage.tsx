import React, { useCallback, useMemo, useState, useEffect } from "react";
import { uploadFile, getUploads, deleteUpload, UploadData } from "../../api/UploadData/UploadDataApi";
import api from "../../api/apiClient";
import AddedConfirmationModal from "../../components/AddedConfirmationModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

type StoredFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
  file?: File;
};

const ACCEPTED_EXTENSIONS = [".xlsx", ".pdf", ".csv", ".json"];
const MIME_ACCEPT: { [key: string]: string[] } = {
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // sometimes xlsx can be octet-stream
    "application/octet-stream",
  ],
  ".csv": ["text/csv", "text/plain"],
  ".json": ["application/json", "text/json"],
  ".pdf": ["application/pdf"],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1));
  return `${value} ${sizes[i]}`;
};

const formatRejectionError = (err: { message: string; code?: string }, file: File) => {
  if (err?.code === 'file-too-large') {
    return `exceeds the maximum of ${formatBytes(MAX_FILE_SIZE)}`;
  }
  if (err?.code === 'file-invalid-type') {
    return `Invalid file type`;
  }
  // fallback: if message contains a byte number, replace it with human-readable
  const m = String(err?.message || '').match(/(\d{4,})/);
  if (m) {
    const bytes = parseInt(m[1], 10);
    if (!Number.isNaN(bytes)) {
      return String(err.message).replace(m[1], formatBytes(bytes));
    }
  }
  return err?.message || 'File rejected';
};

const UploadFilesPage: React.FC = () => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadData[]>([]);
  // success modal state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filtered = acceptedFiles
      .filter((f) => {
        const lower = f.name.toLowerCase();
        return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      })
      .map((f) => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        addedAt: new Date().toISOString(),
        file: f,
      }));

    if (filtered.length > 0) {
      setFiles((prev) => [...filtered, ...prev]);
    }
  }, []);

  const acceptObj = useMemo(() => {
    const obj: { [mime: string]: string[] } = {};
    Object.entries(MIME_ACCEPT).forEach(([ext, mimes]) => {
      mimes.forEach((m) => {
        if (!obj[m]) obj[m] = [];
        if (!obj[m].includes(ext)) obj[m].push(ext);
      });
    });
    return obj;
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
    onDrop,
    multiple: true,
    accept: acceptObj,
    maxSize: MAX_FILE_SIZE,
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const clearAll = () => setFiles([]);

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrorMessage("No files selected to upload");
      return;
    }
    setUploading(true);
    try {
      // use our stored File objects
      const rawFiles: File[] = files.map((f) => f.file).filter(Boolean) as File[];

      if (!rawFiles || rawFiles.length === 0) {
        setErrorMessage("No files selected to upload");
        setUploading(false);
        return;
      }

      // client-side size validation (20MB)
      const tooLarge = rawFiles.find((f) => f.size > MAX_FILE_SIZE);
      if (tooLarge) {
        setErrorMessage(`${tooLarge.name} exceeds the 20MB upload limit.`);
        setUploading(false);
        return;
      }

      // Try to get current logged user id (backend may require it)
      let userId: number | undefined;
      try {
        const u = await api.get('/api/user');
        userId = u.data?.id;
      } catch (e) {
        // ignore — backend may use token to determine user
      }

      // Upload all files in one call (uploadFile accepts File[])
      const results = await uploadFile(rawFiles, userId);

      // clear any prior errors and show success modal
      setErrorMessage(undefined);
      setSuccessMessage(`${results.length} file(s) uploaded`);
      setOpenSuccessModal(true);
      setFiles([]);

      // reload uploaded files for current user
      await loadUploadedFiles();
    } catch (err: any) {
      console.error("Upload error", err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.errors) {
        // Laravel validation errors
        const fileErrs = data.errors.file ?? [];
        const msgs = [...fileErrs, ...(data.message ? [data.message] : [])].join(" ") || JSON.stringify(data.errors);
        setErrorMessage(msgs);
      } else if (data?.message) {
        setErrorMessage(String(data.message));
      } else {
        setErrorMessage("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      let userId: number | undefined;
      try {
        const u = await api.get("/api/user");
        userId = u.data?.id;
      } catch (e) {
        // ignore
      }

      const res = await getUploads();
      if (userId !== undefined) setUploadedFiles(res.filter((r) => r.user_id === userId));
      else setUploadedFiles(res);
    } catch (err) {
      console.error("Failed to load uploaded files", err);
    }
  };

  const handleDeleteUploaded = async (id: number) => {
    try {
      await deleteUpload(id);
      await loadUploadedFiles();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert("Failed to delete file");
    }
  };

  const uploadedCount = files.length;
  const acceptedCount = acceptedFiles.length;

  useEffect(() => {
    loadUploadedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload Files
      </Typography>

      <Paper sx={{ p: 2 }} variant="outlined">
        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, alignItems: 'stretch' }}>
          {/* Left: dropzone (equal width) */}
          <Box sx={{ flexBasis: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column', minHeight: { md: 520 } }}>
            <Paper
              {...getRootProps()}
              variant="outlined"
              sx={{
                p: 4,
                height: { xs: 280, md: '100%' },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                bgcolor: isDragActive ? "grey.50" : "grey.100",
                borderStyle: "dashed",
                borderColor: isDragActive ? "primary.main" : "divider",
                cursor: "pointer",
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: { xs: 44, md: 56 } }} />
              <Typography variant="subtitle1">Drag & drop files here</Typography>
              <Typography variant="body2" color="text.secondary">Supported: XLSX, PDF, CSV, JSON</Typography>
              <Box sx={{ mt: 1 }}>
                <Button variant="contained" startIcon={<UploadFileIcon />}>Select files</Button>
              </Box>
            </Paper>

            {fileRejections.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {fileRejections.map((rej) => (
                  <Alert key={rej.file.name} severity="error" sx={{ mb: 1 }}>
                    {rej.file.name} ({formatBytes(rej.file.size)}): {rej.errors.map((e) => formatRejectionError(e, rej.file)).join("; ")}
                  </Alert>
                ))}
              </Box>
            )}
          </Box>

          {/* Right: uploaded files list (equal width) */}
          <Box sx={{ flexBasis: { xs: '100%', md: '50%' }, display: "flex", flexDirection: "column", minHeight: { md: 520 } }}>
            <Divider />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Selected files</Typography>
            <List sx={{ flex: 1, overflow: "auto" }}>
              {files.length === 0 && (
                <ListItem>
                  <ListItemText primary="No files selected" />
                </ListItem>
              )}
              {files.map((f) => (
                <ListItem key={f.id} divider>
                  <ListItemText
                    primary={f.name}
                    secondary={`${formatBytes(f.size)} • ${new Date(f.addedAt).toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => removeFile(f.id)}>
                      <DeleteIcon sx={{ color: 'error.main' }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {errorMessage && (
              <Box sx={{ mt: 1 }}>
                <Alert severity="error">{errorMessage}</Alert>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="outlined" onClick={clearAll} disabled={files.length === 0 || uploading}>Clear All</Button>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Uploaded files</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{`${uploadedFiles.length} files`}</Typography>
            <List sx={{ flex: 1, overflow: "auto" }}>
              {uploadedFiles.length === 0 && (
                <ListItem>
                  <ListItemText primary="No uploaded files yet" />
                </ListItem>
              )}

              {uploadedFiles.map((u) => (
                <ListItem key={u.id} divider>
                  <ListItemText
                    primary={u.file_name}
                    secondary={`${u.format} • ${new Date(u.created_at).toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteUploaded(u.id)}>
                      <DeleteIcon sx={{ color: 'error.main' }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            
            <AddedConfirmationModal
              open={openSuccessModal}
              title={"Success"}
              content={successMessage || "Upload successful"}
              addFunc={async () => {}}
              handleClose={() => setOpenSuccessModal(false)}
              onSuccess={() => {
                setOpenSuccessModal(false);
              }}
            />

            <DeleteConfirmationModal
              open={openDeleteModal}
              title={"Delete file"}
              content={pendingDeleteName || "Are you sure you want to delete this file?"}
              handleClose={() => setOpenDeleteModal(false)}
              handleReject={() => setOpenDeleteModal(false)}
              deleteFunc={async () => {
                if (pendingDeleteId !== null) {
                  await deleteUpload(pendingDeleteId);
                }
              }}
              onSuccess={async () => {
                setOpenDeleteModal(false);
                setPendingDeleteId(null);
                setPendingDeleteName(null);
                await loadUploadedFiles();
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UploadFilesPage;
