import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, circle, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: circle ? '50%' : '4px',
  };

  return <div className={`skeleton ${className}`} style={style}></div>;
};

export const ConversationItemSkeleton: React.FC = () => {
  return (
    <div className="conversation-item-skeleton">
      <Skeleton circle width="48px" height="48px" />
      <div className="conversation-item-skeleton-content">
        <Skeleton width="60%" height="16px" />
        <Skeleton width="40%" height="14px" />
      </div>
    </div>
  );
};

export const MessageItemSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => {
  return (
    <div className={`message-item-skeleton ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && <Skeleton circle width="32px" height="32px" />}
      <div className="message-bubble-skeleton">
        <Skeleton width="100%" height="14px" />
        <Skeleton width="80%" height="14px" />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
  );
};

export default Skeleton;
