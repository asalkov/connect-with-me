import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

type MessageVariant = 'sent' | 'received';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface Reaction {
  emoji: string;
  count: number;
}

interface MessageBubbleProps {
  variant: MessageVariant;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  sender?: string;
  reactions?: Reaction[];
  onReactionClick?: (emoji: string) => void;
}

const BubbleContainer = styled(Box)<{ variant: MessageVariant }>(({ variant }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: variant === 'sent' ? 'flex-end' : 'flex-start',
  marginBottom: '12px',
  maxWidth: '70%',
  alignSelf: variant === 'sent' ? 'flex-end' : 'flex-start',
}));

const Bubble = styled(Box)<{ variant: MessageVariant }>(({ variant, theme }) => ({
  padding: '12px 16px',
  borderRadius: '20px',
  maxWidth: '100%',
  wordWrap: 'break-word',
  position: 'relative',
  transition: 'all 0.2s ease',
  ...(variant === 'sent'
    ? {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        color: '#FFFFFF',
        borderBottomRightRadius: '6px',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25), 0 1px 3px rgba(37, 99, 235, 0.15)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(37, 99, 235, 0.2)',
          transform: 'translateY(-1px)',
        },
      }
    : {
        backgroundColor: '#FFFFFF',
        color: '#111827',
        borderBottomLeftRadius: '6px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-1px)',
          borderColor: '#D1D5DB',
        },
      }),
}));

const SenderName = styled(Typography)({
  fontSize: '12px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '4px',
  marginLeft: '4px',
});

const TimestampContainer = styled(Box)<{ variant: MessageVariant }>(({ variant }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '4px',
  fontSize: '11px',
  color: '#9CA3AF',
  ...(variant === 'sent' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }),
  marginLeft: variant === 'sent' ? 0 : '4px',
  marginRight: variant === 'sent' ? '4px' : 0,
}));

const StatusIcon = ({ status }: { status: MessageStatus }) => {
  switch (status) {
    case 'sending':
      return <span style={{ fontSize: '14px' }}>⟳</span>;
    case 'sent':
      return <span style={{ fontSize: '14px', color: '#9CA3AF' }}>✓</span>;
    case 'delivered':
      return <span style={{ fontSize: '14px', color: '#9CA3AF' }}>✓✓</span>;
    case 'read':
      return <span style={{ fontSize: '14px', color: '#2563EB' }}>✓✓</span>;
    case 'failed':
      return <span style={{ fontSize: '14px', color: '#EF4444' }}>⚠</span>;
    default:
      return null;
  }
};

const ReactionsContainer = styled(Box)({
  display: 'flex',
  gap: '4px',
  marginTop: '4px',
  flexWrap: 'wrap',
});

const ReactionPill = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '16px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    borderColor: '#2563EB',
    transform: 'scale(1.05)',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
});

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  variant,
  content,
  timestamp,
  status,
  sender,
  reactions,
  onReactionClick,
}) => {
  return (
    <BubbleContainer variant={variant}>
      {variant === 'received' && sender && <SenderName>{sender}</SenderName>}
      
      <Bubble variant={variant}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
      </Bubble>

      {reactions && reactions.length > 0 && (
        <ReactionsContainer>
          {reactions.map((reaction, index) => (
            <ReactionPill
              key={index}
              onClick={() => onReactionClick?.(reaction.emoji)}
            >
              <span>{reaction.emoji}</span>
              <span style={{ fontWeight: 600, color: '#4B5563' }}>{reaction.count}</span>
            </ReactionPill>
          ))}
        </ReactionsContainer>
      )}

      <TimestampContainer variant={variant}>
        <span>{timestamp}</span>
        {variant === 'sent' && status && <StatusIcon status={status} />}
      </TimestampContainer>
    </BubbleContainer>
  );
};

export default MessageBubble;
