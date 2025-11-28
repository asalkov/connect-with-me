import {
  Dialog,
  Box,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface ImagePreviewModalProps {
  open: boolean;
  imageUrl: string;
  imageName?: string;
  senderName?: string;
  timestamp?: string;
  onClose: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

/**
 * Image preview modal component
 * Full-screen image viewer with download/delete options
 * Matches design mockup from DESIGN_MOCKUPS.md Phase 3
 */
export const ImagePreviewModal = ({
  open,
  imageUrl,
  imageName,
  senderName,
  timestamp,
  onClose,
  onDownload,
  onDelete,
  canDelete = false,
}: ImagePreviewModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.95)',
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Image container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        {/* Image */}
        <Box
          component="img"
          src={imageUrl}
          alt={imageName || 'Preview'}
          sx={{
            maxWidth: '90%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: 2,
            boxShadow: 24,
          }}
        />

        {/* Image info */}
        {(senderName || timestamp || imageName) && (
          <Box
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'white',
            }}
          >
            {senderName && (
              <Typography variant="subtitle1" fontWeight={600}>
                {senderName}
              </Typography>
            )}
            {timestamp && (
              <Typography variant="body2" color="grey.400">
                {timestamp}
              </Typography>
            )}
            {imageName && (
              <Typography variant="caption" color="grey.500" sx={{ mt: 1, display: 'block' }}>
                {imageName}
              </Typography>
            )}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          {onDownload && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Download
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};
