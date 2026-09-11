import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    TextField,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { Delete, ThumbUp, ThumbDown, ThumbsUpDown } from "@mui/icons-material";
import { useAllCommentsByVehicle, useAllCommentsCountByLot, useCreateComment, useDeleteCommnet } from "@/queries/comments";
import { format } from "date-fns";
import Loader from "../Loader";
import { FormattedMessage, useIntl } from "react-intl";

const CommentSection = ({ lotId, userId, lotSeller }) => {
    const [newComment, setNewComment] = useState("");
    const [commentType, setCommentType] = useState("NEUTRAL");
    const [showReplies, setShowReplies] = useState({});
    const [newReply, setNewReply] = useState("");
    const [replyTexts, setReplyTexts] = useState({});
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const { data: comments, isLoading, isError, refetch } = useAllCommentsByVehicle(lotId);
    const { data: counts, isLoading: countsLoading, isError: countsError } = useAllCommentsCountByLot(lotId);
    const createCommentMutation = useCreateComment();
    const deleteCommentMutation = useDeleteCommnet();
    const intl = useIntl();

    const handleCommentSubmit = () => {
        if (newComment.trim() === "") return;
        createCommentMutation.mutate(
            { lotId, comment: newComment, userId, type: commentType },
            {
                onSuccess: () => {
                    setNewComment("");
                    refetch();
                },
            }
        );
    };

    const handleReplySubmit = (commentId) => {
        if (!replyTexts[commentId] || replyTexts[commentId].trim() === "") return;

        createCommentMutation.mutate(
            { lotId, comment: replyTexts[commentId], userId, parentComment: commentId, type: "REPLY" },
            {
                onSuccess: () => {
                    setReplyTexts((prev) => ({ ...prev, [commentId]: "" })); // Clear only the submitted reply
                    setSelectedCommentId(null);
                    refetch();
                },
            }
        );
    };

    const handleReplyChange = (commentId, value) => {
        setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleDeleteComment = (commentId) => {
        deleteCommentMutation.mutate(commentId, {
            onSuccess: () => refetch(),
        });
    };

    const handleTypeChange = (event, newType) => {
        if (newType) setCommentType(newType);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "POSITIVE":
                return "success";
            case "NEGATIVE":
                return "error";
            case "NEUTRAL":
                return "default";
            default:
                return "default";
        }
    };

    const getTypeColorSx = (type) => {
        switch (type) {
            case "POSITIVE":
                return "green";
            case "NEGATIVE":
                return "red";
            case "NEUTRAL":
                return "gray";
            default:
                return "default";
        }
    };

    if (isLoading || countsLoading) return <Loader />;
    if (isError || countsError) return <Typography color="error">Failed to load comments.</Typography>;

    return (
        <Box sx={{ display: "flex", gap: 3, p: 2 }}>
            {/* Left Sidebar - Comment Counts */}
            <Box
                sx={{
                    width: 200,
                    p: 2,
                    bgcolor: "#f9f9f9",
                    borderRadius: 2,
                    boxShadow: 1,
                    height: "fit-content",
                    position: "sticky",
                    top: 20,
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    <FormattedMessage id="commentstats" />
                </Typography>
                <Chip label={`Total: ${counts?.data?.totalCount || 0}`} color="primary" sx={{ mb: 1, width: "100%" }} />
                <Chip label={`👍 Positive: ${counts?.data?.positiveCount || 0}`} color="success" sx={{ mb: 1, width: "100%" }} />
                <Chip label={`😐 Neutral: ${counts?.data?.neutralCount || 0}`} color="default" sx={{ mb: 1, width: "100%" }} />
                <Chip label={`👎 Negative: ${counts?.data?.negativeCount || 0}`} color="error" sx={{ width: "100%" }} />
            </Box>

            {/* Right Side - Comments Section */}
            <Box sx={{ maxWidth: 600, flexGrow: 1 }}>

                {/* Comment List */}
                {comments?.data?.length === 0 ? (
                    <Typography color="text.secondary"><FormattedMessage id="nocommentsyet" /></Typography>
                ) : (
                    comments?.data?.map((comment) => (
                        <Card key={comment.id} sx={{ mb: 2, p: 1, borderLeft: `4px solid`, borderColor: getTypeColorSx(comment.type) }}>
                            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                {/* User Avatar */}
                                <Avatar sx={{ bgcolor: "primary.main" }}>
                                    {comment.user?.firstname ? comment.user.firstname[0] : "U"}
                                </Avatar>

                                <Box sx={{ flexGrow: 1 }}>
                                    {/* User Info */}
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {comment.user?.firstname} {comment.user?.lastname} <span style={{ color: "#666" }}>({comment.user?.secretName})</span>
                                    </Typography>

                                    {/* Comment Text */}
                                    <Typography variant="body1" sx={{ mt: 0.5 }}>{comment.comment}</Typography>

                                    {/* Additional Info */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(comment.createdAt), "PPPp")}
                                        </Typography>
                                        <Chip size="small" label={comment.type} color={getTypeColor(comment.type)} />
                                    </Box>

                                    {/* If the user is the seller and the comment has no replies, show a reply input */}
                                    {/* Show Reply Input for the Selected Comment */}
                                    {lotSeller === userId && (
                                        <Box sx={{ mt: 2 }}>
                                            {selectedCommentId === comment.id && (
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                    <TextField
                                                        value={replyTexts[comment.id] || ""}
                                                        onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                                        label={intl.formatMessage({ id: 'writereply' })}
                                                        multiline
                                                        rows={2}
                                                        variant="outlined"
                                                        fullWidth
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleReplySubmit(comment.id)}
                                                        disabled={createCommentMutation.isLoading}
                                                    >
                                                        {createCommentMutation.isLoading ? <><FormattedMessage id="reply" />... </> : <FormattedMessage id="reply" />}
                                                    </Button>
                                                </Box>
                                            )}
                                            {/* Show "Reply" button only if no reply input is open */}
                                            {selectedCommentId !== comment.id && (
                                                <Button
                                                    variant="text"
                                                    color="primary"
                                                    onClick={() => setSelectedCommentId(comment.id)}
                                                >
                                                    <FormattedMessage id="reply" />
                                                </Button>
                                            )}
                                        </Box>
                                    )}




                                    {/* Show Seller Reply Button if there are replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => setShowReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}>
                                            {showReplies[comment.id] ? <FormattedMessage id="hidereply" /> : <FormattedMessage id="showreply" />}
                                        </Button>
                                    )}

                                    {/* Display Replies when Seller Reply is Open */}
                                    {showReplies[comment.id] && comment.replies && comment.replies.map(reply => (
                                        <Card key={reply.id} sx={{ mt: 1, backgroundColor: "#f5f5f5" }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    <FormattedMessage id="seller" />
                                                </Typography>
                                                <Typography variant="body1">{reply.comment}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(reply.createdAt), "PPPp")}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>

                                {/* Delete Button for User's Own Comment */}
                                {comment.user.id === userId &&
                                    <IconButton onClick={() => handleDeleteComment(comment.id)} color="error">
                                        <Delete />
                                    </IconButton>
                                }
                            </CardContent>
                        </Card>
                    ))
                )}

                {/* Add New Comment */}
                {lotSeller !== userId && (
                    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            label={intl.formatMessage({ id: "writecomment" })}
                            multiline
                            rows={2}
                            variant="outlined"
                            fullWidth
                        />

                        <ToggleButtonGroup
                            value={commentType}
                            exclusive
                            onChange={handleTypeChange}
                            aria-label="comment type"
                        >
                            <ToggleButton value="POSITIVE" aria-label="positive">
                                <ThumbUp color="success" />
                            </ToggleButton>
                            <ToggleButton value="NEUTRAL" aria-label="neutral">
                                <ThumbsUpDown color="primary" />
                            </ToggleButton>
                            <ToggleButton value="NEGATIVE" aria-label="negative">
                                <ThumbDown color="error" />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCommentSubmit}
                            disabled={createCommentMutation.isLoading}
                        >
                            {createCommentMutation.isLoading ? <><FormattedMessage id="postcomment" />...</> : <FormattedMessage id="postcomment" />}
                        </Button>
                    </Box>)}
            </Box>
        </Box>
    );
};

export default CommentSection;
