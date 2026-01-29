import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useContext,
    useRef,
} from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from '@mui/icons-material/Save';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import FileModal from "../../components/FileModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';

const reducer = (state, action) => {
    if (action.type === "LOAD_FILES") {
        const files = action.payload;
        const newFiles = [];

        files.forEach((fileList) => {
            const fileListIndex = state.findIndex((s) => s.id === fileList.id);
            if (fileListIndex !== -1) {
                state[fileListIndex] = fileList;
            } else {
                newFiles.push(fileList);
            }
        });

        return [...state, ...newFiles];
    }

    if (action.type === "UPDATE_FILES") {
        const fileList = action.payload;
        const fileListIndex = state.findIndex((s) => s.id === fileList.id);

        if (fileListIndex !== -1) {
            state[fileListIndex] = fileList;
            return [...state];
        } else {
            return [fileList, ...state];
        }
    }

    if (action.type === "DELETE_FILE") {
        const fileListId = action.payload;

        const fileListIndex = state.findIndex((s) => s.id === fileListId);
        if (fileListIndex !== -1) {
            state.splice(fileListIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "visible",
    },
    emptyState: {
        padding: theme.spacing(4),
        borderRadius: 16,
        border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
        textAlign: "center",
    },
    entityCard: {
        borderRadius: 16,
        border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.55)" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(14px)",
        boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.10)",
        transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.palette.type === "dark" ? "0 22px 56px rgba(0,0,0,0.55)" : "0 14px 34px rgba(0,0,0,0.14)",
        },
    },
    actionsRow: {
        justifyContent: "center",
        gap: theme.spacing(1.25),
        paddingBottom: theme.spacing(2),
        paddingTop: theme.spacing(1),
    },
    actionButton: {
        borderRadius: 12,
        minWidth: 44,
        width: 44,
        height: 44,
        boxShadow: "none",
        color: "white",
    },
    actionEdit: {
        background: theme.palette.primary.main,
        "&:hover": {
            background: theme.palette.primary.dark,
        },
    },
    actionDelete: {
        background: theme.palette.error.main,
        "&:hover": {
            background: theme.palette.error.dark,
        },
    },
}));

const FileLists = () => {
    const classes = useStyles();

    //   const socketManager = useContext(SocketContext);
    const { user, socket } = useContext(AuthContext);


    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedFileList, setSelectedFileList] = useState(null);
    const [deletingFileList, setDeletingFileList] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [files, dispatch] = useReducer(reducer, []);
    const [fileListModalOpen, setFileListModalOpen] = useState(false);

    const fetchFileLists = useCallback(async () => {
        try {
            const { data } = await api.get("/files/", {
                params: { searchParam, pageNumber },
            });
            dispatch({ type: "LOAD_FILES", payload: data.files });
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            toastError(err);
        }
    }, [searchParam, pageNumber]);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetchFileLists();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, fetchFileLists]);

    useEffect(() => {
        // const socket = socketManager.GetSocket(user.companyId, user.id);

        const onFileEvent = (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_FILES", payload: data.files });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_FILE", payload: +data.fileId });
            }
        };

        socket.on(`company-${user.companyId}-file`, onFileEvent);
        return () => {
            socket.off(`company-${user.companyId}-file`, onFileEvent);
        };
    }, [socket]);

    const handleOpenFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(true);
    };

    const handleCloseFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditFileList = (fileList) => {
        setSelectedFileList(fileList);
        setFileListModalOpen(true);
    };

    const handleDeleteFileList = async (fileListId) => {
        try {
            await api.delete(`/files/${fileListId}`);
            toast.success(i18n.t("files.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingFileList(null);
        setSearchParam("");
        setPageNumber(1);

        dispatch({ type: "RESET" });
        setPageNumber(1);
        await fetchFileLists();
    };

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const loadMoreIfNeeded = useCallback(() => {
        if (!hasMore || loading) return;
        loadMore();
    }, [hasMore, loading]);

    const loadMoreSentinelRef = useRef(null);

    useEffect(() => {
        const root = document.querySelector("main");
        const target = loadMoreSentinelRef.current;
        if (!root || !target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) loadMoreIfNeeded();
            },
            { root, rootMargin: "400px 0px 400px 0px", threshold: 0 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMoreIfNeeded]);

    return (
        <MainContainer>
            <ConfirmationModal
                title={deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteFileList(deletingFileList.id)}
            >
                {i18n.t("files.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <FileModal
                open={fileListModalOpen}
                onClose={handleCloseFileListModal}
                reload={fetchFileLists}
                aria-labelledby="form-dialog-title"
                fileListId={selectedFileList && selectedFileList.id}
            />
            {user.profile === "user" ? (
                <ForbiddenPage />
            ) : (
                <>
                    <MainHeader>
                        <Title>{i18n.t("files.title")} ({files.length})</Title>
                        <MainHeaderButtonsWrapper>
                            <TextField
                                placeholder={i18n.t("contacts.searchPlaceholder")}
                                type="search"
                                value={searchParam}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon style={{ color: "#FFA500" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                startIcon={<SaveIcon />}
                                variant="contained"
                                style={{
                                color: "white",
                                backgroundColor: "#FFA500",
                                boxShadow: "none",
                                borderRadius: "5px",
                                }}
                                onClick={handleOpenFileListModal}
                            >
                                {i18n.t("files.buttons.add")}
                            </Button>
                        </MainHeaderButtonsWrapper>
                    </MainHeader>
                    <Paper
                        className={classes.mainPaper}
                        variant="outlined"
                    >
                        {files.length === 0 && !loading && (
                            <div className={classes.emptyState}>
                                <Typography variant="subtitle1" color="textPrimary">
                                    Nenhum arquivo encontrado
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Ajuste a busca ou adicione um novo arquivo.
                                </Typography>
                            </div>
                        )}
<Grid container spacing={2}>
  {loading ? (
    <Grid item xs={12}>
      <Card variant="outlined" className={classes.entityCard}>
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t("loading")}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ) : (
    files.map((fileList) => (
      <Grid item xs={12} sm={6} md={4} key={fileList.id}>
        <Card
          variant="outlined"
          className={classes.entityCard}
        >
          <CardContent>
            <Typography variant="h6" color="textPrimary" align="center">
              {fileList.name}
            </Typography>
          </CardContent>
          <CardActions className={classes.actionsRow}>
            <Button
              variant="contained"
              className={`${classes.actionButton} ${classes.actionEdit}`}
              onClick={() => handleEditFileList(fileList)}
            >
              <EditIcon fontSize="small" />
            </Button>
            <Button
              variant="contained"
              className={`${classes.actionButton} ${classes.actionDelete}`}
              onClick={() => {
                setConfirmModalOpen(true);
                setDeletingFileList(fileList);
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </Button>
          </CardActions>

        </Card>
      </Grid>
    ))
  )}
</Grid>
                        <div ref={loadMoreSentinelRef} />

                    </Paper>
                </>
            )}
        </MainContainer>
    );
};

export default FileLists;
