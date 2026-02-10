import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import CustomButton from "./CustomButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const useStyles = makeStyles(() => ({
  addBtn: {
    paddingLeft: "1rem",
    paddingRight: "1rem",
  },
}));

interface Props {
  open: boolean;
  title: string;
  content: any;
  addFunc: () => Promise<void>;
  onSuccess?: () => void;
  handleClose: () => void;
  addButtonDisabled?: boolean;
  customAddButtonText?: string;
  customAddButtonIcon?: ReactNode;
}

const AddedConfirmationModal = ({
  open,
  title,
  content,
  handleClose,
  addFunc,
  onSuccess = () => {},
  addButtonDisabled,
  customAddButtonText,
  customAddButtonIcon,
}: Props) => {
  const classes = useStyles();
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    try {
      setSubmitting(true);
      await addFunc();
      onSuccess(); // notify parent if needed
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      aria-labelledby={title + "-dialog"}
    >
      <DialogTitle id={title + "-dialog"}>{title}</DialogTitle>

      <DialogContent dividers>
        <DialogContentText>
             {content}  
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CustomButton
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-green)" }}
          startIcon={customAddButtonIcon ? customAddButtonIcon : <CheckCircleIcon />}
          disabled={submitting || addButtonDisabled}
          onClick={handleAdd}
          className={classes.addBtn}
        >
          {customAddButtonText || "OK"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddedConfirmationModal;
