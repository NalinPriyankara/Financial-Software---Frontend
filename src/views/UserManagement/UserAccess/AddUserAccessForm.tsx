import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../theme";
import {
  createSecurityRole,
  getSecurityRoles,
  getSecurityRole,
  updateSecurityRole,
  deleteSecurityRole,
} from "../../../api/AccessSetup/AccessSetupApi";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import { useEffect } from "react";
import { PERMISSION_ID_MAP } from "../../../permissions/map";

const permissionList = [
  "Sales Management",
  "Expense Management",
  "Production Management",
  "Inventory Management",
  "Bank Management",
  "Loan Management",
  "Creditors Management",
  "Debtors Management",
  "Reports",
  "Data Upload",
  "Management Incent",
  "User Management",
  "Settings",
];

const managementNested = [
  "Past Year Analysis",
  "Next Year Analysis",
  "Achievement Targets",
];

const settingsNested = [
  "Company Setup",
  "Profile Settings",
];

const salesNested = ["Sale", "Sale Items", "Sales Reports"];
const expenseNested = ["Add Expense", "View Expenses", "Expense Reports"];
const productionNested = ["Production", "Production Items", "Production Reports"];
const inventoryNested = ["Items", "Stock List", "Stock Reports"];
const bankNested = ["Bank Accounts", "Bank Transactions", "Bank Reports"];
const loanNested = ["Add Loan", "Loan Installments", "Loan Reports"];
const creditorsNested = ["Suppliers", "Creditors List"];
const debtorsNested = ["Customers", "Debtors List"];
const reportsNested = ["Profit Reports"];
const userManagementNested = ["User Account Setup", "User Roles Management"];

const SECTION_NESTED_MAP: Record<string, string[]> = {
  "Management Incent": managementNested,
  "Settings": settingsNested,
  "Sales Management": salesNested,
  "Expense Management": expenseNested,
  "Production Management": productionNested,
  "Inventory Management": inventoryNested,
  "Bank Management": bankNested,
  "Loan Management": loanNested,
  "Creditors Management": creditorsNested,
  "Debtors Management": debtorsNested,
  "Reports": reportsNested,
  "User Management": userManagementNested,
};

// Permission -> ID mapping (complete, easy-to-follow)
// Pattern used:
// - Top-level sections: start at 1000 and increment by 10 (1000, 1010, ...)
// - Nested areas: assigned sequentially starting from parentID + 1
// Adjust IDs if your backend uses different values.
// local mapping removed; use central PERMISSION_ID_MAP import

interface UserAccessFormData {
  selectedRole: string;
  roleName: string;
  roleDescription: string;
  status: string;
  permissions: string[];
}

export default function AddUserAccessForm() {
  const [formData, setFormData] = useState<UserAccessFormData>({
    selectedRole: "__new",
    roleName: "",
    roleDescription: "",
    status: "",
    permissions: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserAccessFormData, string>>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [availableRoles, setAvailableRoles] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [isNewMode, setIsNewMode] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addedModalOpen, setAddedModalOpen] = useState(false);
  const [addedModalTitle, setAddedModalTitle] = useState("");
  const [addedModalContent, setAddedModalContent] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // load available roles
    const load = async () => {
      try {
        const data = await getSecurityRoles();
        setAvailableRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };

    load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const { name, value } = e.target;
    // if selecting role
    if (name === "selectedRole") {
      // user picked 'Add New Role'
      if (value === "__new") {
        setIsNewMode(true);
        setFormData({
          selectedRole: "",
          roleName: "",
          roleDescription: "",
          status: "",
          permissions: [],
        });
        return;
      }

      // user picked an existing role
      if (value) {
        const selected = availableRoles.find((r) => String(r.id) === String(value));
        if (selected) {
          setIsNewMode(false);
        // build permission names from sections and areas (reverse map)
        const perms: string[] = [];

        const sectionsStr: string | null = selected.sections || selected.sections === "" ? selected.sections : null;
        const areasStr: string | null = selected.areas || selected.areas === "" ? selected.areas : null;

        const reverseMap: Record<number, string> = {};
        Object.keys(PERMISSION_ID_MAP).forEach((k) => {
          reverseMap[PERMISSION_ID_MAP[k]] = k;
        });

        if (sectionsStr) {
          sectionsStr.split(";").forEach((s: string) => {
            const id = Number(s);
            if (reverseMap[id]) perms.push(reverseMap[id]);
          });
        }
        if (areasStr) {
          areasStr.split(";").forEach((a: string) => {
            const id = Number(a);
            if (reverseMap[id]) perms.push(reverseMap[id]);
          });
        }

          setFormData((prev) => ({
            ...prev,
            selectedRole: String(selected.id),
            roleName: selected.role || prev.roleName,
            roleDescription: selected.description || prev.roleDescription,
            status: selected.inactive ? "inactive" : "active",
            permissions: perms,
          }));
          return;
        }
      }
      // if value is empty or not found we'll fallthrough to set raw value below
    }
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

      // If a top-level section is unchecked, remove its nested permissions
      let filteredPermissions = newPermissions;
      // when a section is checked, add its nested items; when unchecked, remove them
      const nested = SECTION_NESTED_MAP[permission];
      if (nested && nested.length) {
        if (newPermissions.includes(permission)) {
          filteredPermissions = Array.from(new Set([...newPermissions, ...nested]));
        } else {
          filteredPermissions = newPermissions.filter((p) => !nested.includes(p));
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
    const newErrors: Partial<Record<keyof UserAccessFormData, string>> = {};

    if (!formData.roleName) newErrors.roleName = "Role Name is required";
    // description is optional
    if (!formData.status) newErrors.status = "Status is required";

    // When inserting a new role, require at least one permission
    if (isNewMode || !formData.selectedRole || formData.selectedRole === "__new") {
      if (!formData.permissions || formData.permissions.length === 0)
        newErrors.permissions = "At least one permission must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      // Build sections (top-level permission ids) and areas (nested ids)
      const selectedSections = new Set<number>();
      const selectedAreas = new Set<number>();

      formData.permissions.forEach((perm) => {
        const id = PERMISSION_ID_MAP[perm];
        if (id) {
          // decide if this perm is a top-level section or nested area by checking whether
          // the value exists among top-level permissionList
          if (permissionList.includes(perm)) selectedSections.add(id);
          else selectedAreas.add(id);
        }
      });

      // Convert sets to semicolon-separated strings. Order doesn't matter but we'll preserve insertion order
      const sectionsStr = Array.from(selectedSections).join(";");
      const areasStr = Array.from(selectedAreas).join(";");

      const payload = {
        role: formData.roleName,
        description: formData.roleDescription,
        sections: sectionsStr || null,
        areas: areasStr || null,
        inactive: formData.status !== "active",
      };

      const doCreate = async () => {
        try {
          const res = await createSecurityRole(payload);
          console.log("Created role:", res);
          setAddedModalTitle("Role created");
          setAddedModalContent(<Typography>Role created successfully</Typography>);
          setAddedModalOpen(true);
          // reset form
          setFormData({
            selectedRole: "",
            roleName: "",
            roleDescription: "",
            status: "",
            permissions: [],
          });
          // go back to new-role default
          setFormData({
            selectedRole: "__new",
            roleName: "",
            roleDescription: "",
            status: "",
            permissions: [],
          });
          setIsNewMode(true);
        } catch (err) {
          console.error("Create role error:", err);
          alert("Failed to create role. See console for details.");
        } finally {
          setLoading(false);
          // refresh roles
          try {
            const data = await getSecurityRoles();
            setAvailableRoles(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error("Failed to refresh roles", e);
          }
        }
      };

      const doUpdate = async (id: string | number) => {
        try {
          const res = await updateSecurityRole(id, payload);
          console.log("Updated role:", res);
          setAddedModalTitle("Role updated");
          setAddedModalContent(<Typography>Role updated successfully</Typography>);
          setAddedModalOpen(true);
              // reset form to new-role default
              setFormData({
                selectedRole: "__new",
                roleName: "",
                roleDescription: "",
                status: "",
                permissions: [],
              });
              setIsNewMode(true);
        } catch (err) {
          console.error("Update role error:", err);
          alert("Failed to update role. See console for details.");
        } finally {
          setLoading(false);
          // refresh roles
          try {
            const data = await getSecurityRoles();
            setAvailableRoles(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error("Failed to refresh roles", e);
          }
        }
      };

      // if selectedRole is set, update; otherwise create
      if (isNewMode || !formData.selectedRole) {
        await doCreate();
      } else {
        await doUpdate(formData.selectedRole);
      }
    }
  };

  const handleDelete = async () => {
    if (!formData.selectedRole) return;
    setLoading(true);
    try {
      await deleteSecurityRole(formData.selectedRole);
      setFormData({
        selectedRole: "__new",
        roleName: "",
        roleDescription: "",
        status: "",
        permissions: [],
      });
      setIsNewMode(true);
      const data = await getSecurityRoles();
      setAvailableRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Delete role error:", err);
      alert("Failed to delete role. See console for details.");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
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
            <MenuItem value="__new">+ Add New Role</MenuItem>
            {availableRoles.map((r) => (
              <MenuItem key={r.id} value={String(r.id)}>
                {r.role}
              </MenuItem>
            ))}
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

                  {SECTION_NESTED_MAP[perm] && formData.permissions.includes(perm) && (
                    <Box sx={{ pl: 4 }}>
                      {SECTION_NESTED_MAP[perm].map((nested) => (
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

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            mt: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button fullWidth={isMobile} onClick={() => navigate("/dashboard")} disabled={loading}>
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 1, width: isMobile ? "100%" : "auto" }}>
            {formData.selectedRole && formData.selectedRole !== "__new" && (
              <Button
                color="error"
                variant="outlined"
                disabled={loading}
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            )}

            <Button
              variant="contained"
              fullWidth={isMobile}
              sx={{ backgroundColor: "var(--pallet-blue)" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {formData.selectedRole ? "Save" : "Insert New Role"}
            </Button>
          </Box>
        </Box>
        <DeleteConfirmationModal
          open={deleteModalOpen}
          title="Delete Role"
          content={<Typography>Are you sure you want to delete this role?</Typography>}
          handleClose={() => setDeleteModalOpen(false)}
          handleReject={() => setDeleteModalOpen(false)}
          deleteFunc={async () => handleDelete()}
          onSuccess={() => {}}
        />
        <AddedConfirmationModal
          open={addedModalOpen}
          title={addedModalTitle}
          content={addedModalContent}
          handleClose={() => setAddedModalOpen(false)}
          addFunc={async () => setAddedModalOpen(false)}
        />
      </Paper>
    </Stack>
  );
}
