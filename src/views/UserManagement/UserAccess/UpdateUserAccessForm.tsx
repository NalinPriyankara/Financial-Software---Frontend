import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import theme from "../../../theme";
import { useNavigate } from "react-router";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import { deleteSecurityRole } from "../../../api/AccessSetup/AccessSetupApi";

const permissionList = [
  "Data Upload",
  "Management Incent",
  "Setup",
];

const managementNested = ["Past Year Analysis", "Next Year Analysis", "Achievement Targets"];
const setupNested = ["Company Setup", "User Management", "User Roles"];

interface UserAccessFormData {
  selectedRole: string;
  roleName: string;
  roleDescription: string;
  status: string;
  permissions: string[];
}

export default function UpdateUserAccessForm() {
  const [formData, setFormData] = useState<UserAccessFormData>({
    selectedRole: "",
    roleName: "",
    roleDescription: "",
    status: "",
    permissions: [],
  });

  const [errors, setErrors] = useState<Partial<UserAccessFormData>>({});
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permission: string) => {
    setFormData((prev) => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];

      let filteredPermissions = newPermissions;
      // when checked, add nested permissions; when unchecked, remove them
      if (permission === "Management Incent") {
        if (newPermissions.includes("Management Incent")) {
          filteredPermissions = Array.from(new Set([...newPermissions, ...managementNested]));
        } else {
          filteredPermissions = newPermissions.filter((p) => !managementNested.includes(p));
        }
      }
      if (permission === "Setup") {
        if (newPermissions.includes("Setup")) {
          filteredPermissions = Array.from(new Set([...newPermissions, ...setupNested]));
        } else {
          filteredPermissions = newPermissions.filter((p) => !setupNested.includes(p));
        }
      }

      return { ...prev, permissions: filteredPermissions };
    });
  };

  const handleNestedPermissionChange = (nestedPermission: string) => {
    setFormData((prev) => {
      const newPermissions = prev.permissions.includes(nestedPermission)
        ? prev.permissions.filter((p) => p !== nestedPermission)
        : [...prev.permissions, nestedPermission];
      return { ...prev, permissions: newPermissions };
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<UserAccessFormData> = {};

    if (!formData.roleName) newErrors.roleName = "Role Name is required";
    if (!formData.roleDescription)
      newErrors.roleDescription = "Role Description is required";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Data:", formData);
      alert("Form submitted successfully!");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!formData.selectedRole) return;
    try {
      await deleteSecurityRole(formData.selectedRole);
      alert("Role deleted");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to delete role");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      {/* Dropdown to select existing roles */}
      <Box sx={{ width: "100%", maxWidth: "600px", mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Role</InputLabel>
          <Select
            name="selectedRole"
            value={formData.selectedRole}
            onChange={handleChange}
            label="Select Role"
          >
            <MenuItem value="">-- Select Role --</MenuItem>
            <MenuItem value="Admin">AP Officer</MenuItem>
            <MenuItem value="Manager">AR Officer</MenuItem>
            <MenuItem value="Employee">Inquiries</MenuItem>
            <MenuItem value="Admin">Accountant</MenuItem>
            <MenuItem value="Manager">Production Manager</MenuItem>
            <MenuItem value="Employee">Purchase Officer</MenuItem>
            <MenuItem value="Admin">Salesman</MenuItem>
            <MenuItem value="Manager">Stock Manager</MenuItem>
            <MenuItem value="Employee">Sub Admin</MenuItem>
            <MenuItem value="Employee">System Adminitrator</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: "600px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>
          Role Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Role Name"
            name="roleName"
            size="small"
            fullWidth
            value={formData.roleName}
            onChange={handleChange}
            error={!!errors.roleName}
            helperText={errors.roleName}
          />

          <TextField
            label="Role Description"
            name="roleDescription"
            size="small"
            fullWidth
            value={formData.roleDescription}
            onChange={handleChange}
            error={!!errors.roleDescription}
            helperText={errors.roleDescription}
          />

          <FormControl size="small" fullWidth error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
          </FormControl>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Permissions
            </Typography>
            <FormGroup>
              {permissionList.map((perm) => (
                <Box key={perm}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                      />
                    }
                    label={perm}
                  />

                  {perm === "Management Incent" &&
                    formData.permissions.includes("Management Incent") && (
                      <Box sx={{ pl: 4 }}>
                        {managementNested.map((nested) => (
                          <FormControlLabel
                            key={nested}
                            control={
                              <Checkbox
                                checked={formData.permissions.includes(nested)}
                                onChange={() => handleNestedPermissionChange(nested)}
                              />
                            }
                            label={nested}
                          />
                        ))}
                      </Box>
                    )}

                  {perm === "Setup" &&
                    formData.permissions.includes("Setup") && (
                      <Box sx={{ pl: 4 }}>
                        {setupNested.map((nested) => (
                          <FormControlLabel
                            key={nested}
                            control={
                              <Checkbox
                                checked={formData.permissions.includes(nested)}
                                onChange={() => handleNestedPermissionChange(nested)}
                              />
                            }
                            label={nested}
                          />
                        ))}
                      </Box>
                    )}
                </Box>
              ))}
            </FormGroup>
            {errors.permissions && (
              <FormHelperText sx={{ color: "red" }}>
                {errors.permissions}
              </FormHelperText>
            )}
          </Box>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
          <Button onClick={() => navigate("/dashboard")}>Back</Button>

          <Box sx={{ display: "flex", gap: 1 }}>
            {formData.selectedRole && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            )}

            <Button
              variant="contained"
              sx={{ backgroundColor: "var(--pallet-blue)" }}
              onClick={handleSubmit}
            >
              Insert New Role
            </Button>
          </Box>
        </Box>
        <DeleteConfirmationModal
          open={deleteModalOpen}
          title="Delete Role"
          content={<Typography>Are you sure you want to delete this role?</Typography>}
          handleClose={() => setDeleteModalOpen(false)}
          handleReject={() => setDeleteModalOpen(false)}
          deleteFunc={async () => handleDeleteConfirmed()}
          onSuccess={() => {
            /* navigation handled in handleDeleteConfirmed */
          }}
        />
      </Paper>
    </Stack>
  );
}
