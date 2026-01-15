"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Reusable Dialog Layout component
 * 
 * @param {boolean} open - is dialog open
 * @param {function} onClose - close handler
 * @param {string} title - dialog title (optional)
 * @param {string} maxWidth - MUI maxWidth: "xs" | "sm" | "md" | "lg" | "xl"
 * @param {boolean} fullWidth - use full width
 * @param {boolean} showCloseButton - show close button in title
 * @param {boolean} loading - show loading state
 * @param {ReactNode} stickyHeader - content for sticky header (optional)
 * @param {ReactNode} actions - content for DialogActions (optional)
 * @param {object} contentSx - additional styles for DialogContent
 * @param {object} sx - additional styles for Dialog
 * @param {ReactNode} children - content
 */
const DialogLayout = ({
  open,
  onClose,
  title,
  maxWidth = "sm",
  fullWidth = true,
  showCloseButton = true,
  loading = false,
  stickyHeader,
  actions,
  contentSx,
  sx,
  children,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            p: 8,
          }}
        >
          <CircularProgress sx={{ color: "primary.main" }} />
          <CircularProgress sx={{ color: "secondary.main" }} />
          <CircularProgress sx={{ color: "triadic.green" }} />
        </Box>
      ) : (
        <>
          {/* Title with optional close button */}
          {(title || showCloseButton) && (
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
                px: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {title && (
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  {title}
                </Typography>
              )}
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                  }}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </DialogTitle>
          )}

          {/* Optional sticky header below title */}
          {stickyHeader && (
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                backgroundColor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1.5,
                px: 3,
                textAlign: "center",
              }}
            >
              {stickyHeader}
            </Box>
          )}

          {/* Main content */}
          <DialogContent
            sx={{
              px: 3,
              py: 2,
              ...contentSx,
            }}
          >
            {children}
          </DialogContent>

          {/* Optional actions */}
          {actions && (
            <DialogActions
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {actions}
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  );
};

export default DialogLayout;

