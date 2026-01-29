import React, { useState, useEffect, useReducer, useContext, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import CircularProgress from "@material-ui/core/CircularProgress";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import { AccountCircle } from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import GlassCard from "../../components/UI/GlassCard";
import PrimaryButton from "../../components/UI/PrimaryButton";
import whatsappIcon from '../../assets/nopicture.png'
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { SocketContext, socketManager } from "../../context/Socket/SocketContext";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Avatar } from "@material-ui/core";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

const backendUrl = getBackendUrl();

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
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
    padding: theme.spacing(2),
    overflowY: "visible",
  },
  searchIcon: {
    color: theme.palette.primary.main,
  },
  userAvatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  avatarDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  loadingText: {
    marginLeft: theme.spacing(2),
  },
  mobileCard: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  mobileCardContent: {
    padding: theme.spacing(1),
  },
  mobileActionButton: {
    minWidth: '36px',
    padding: '6px',
    margin: '0 4px',
  },
  entityCard: {
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.55)" : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(14px)",
    boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.10)",
    transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
    cursor: "default",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.palette.type === "dark" ? "0 22px 56px rgba(0,0,0,0.55)" : "0 14px 34px rgba(0,0,0,0.14)",
    },
  },
  entityCardContent: {
    paddingBottom: theme.spacing(1),
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
  },
  actionEdit: {
    background: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      background: theme.palette.primary.dark,
    },
  },
  actionDelete: {
    background: theme.palette.error.main,
    color: "white",
    "&:hover": {
      background: theme.palette.error.dark,
    },
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
}));

const Users = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const { user: loggedInUser, socket } = useContext(AuthContext)
  const { profileImage } = loggedInUser;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_USERS", payload: data.users });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchUsers();
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (loggedInUser) {
      const companyId = loggedInUser.companyId;
      const onCompanyUser = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_USERS", payload: data.user });
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_USER", payload: +data.userId });
        }
      };
      socket.on(`company-${companyId}-user`, onCompanyUser);
      return () => {
        socket.off(`company-${companyId}-user`, onCompanyUser);
      };
    }
  }, [socket]);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setLoadingMore(true);
    setPageNumber((prevPage) => prevPage + 1);
  };

  const loadMoreIfNeeded = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    loadMore();
  }, [hasMore, loading, loadingMore]);

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

  const renderProfileImage = (user) => {
    if (user.id === loggedInUser.id) {
      return (
        <Avatar
          src={`${backendUrl}/public/company${user.companyId}/user/${profileImage ? profileImage : whatsappIcon}`}
          alt={user.name}
          className={classes.userAvatar}
        />
      )
    }
    if (user.id !== loggedInUser.id) {
      return (
        <Avatar
          src={user.profileImage ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` : whatsappIcon}
          alt={user.name}
          className={classes.userAvatar}
        />
      )
    }
    return (
      <AccountCircle />
    )
  };

  const renderCardActions = (user) => {
    return (
      <CardActions className={classes.actionsRow}>
        <Button
          variant="contained"
          onClick={() => handleEditUser(user)}
          className={`${classes.actionButton} ${classes.actionEdit}`}
        >
          <EditIcon fontSize="small" />
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setConfirmModalOpen(true);
            setDeletingUser(user);
          }}
          className={`${classes.actionButton} ${classes.actionDelete}`}
        >
          <DeleteOutlineIcon fontSize="small" />
        </Button>
      </CardActions>
    );
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name
          }?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
      />
      {loggedInUser.profile === "user" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <Title>{i18n.t("users.title")} ({users.length})</Title>
            <MainHeaderButtonsWrapper>
              <TextField
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className={classes.searchIcon} />
                    </InputAdornment>
                  ),
                }}
                style={{ width: isMobile ? "100%" : "auto" }}
              />
              <PrimaryButton
                startIcon={<AddIcon />}
                onClick={handleOpenUserModal}
              >
                {i18n.t("users.buttons.add")}
              </PrimaryButton>
            </MainHeaderButtonsWrapper>
          </MainHeader>
          <GlassCard
            className={classes.mainPaper}
          >
            {users.length === 0 && !loading && !loadingMore && (
              <div className={classes.emptyState}>
                <Typography variant="subtitle1" color="textPrimary">
                  Nenhum usuário encontrado
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ajuste a busca ou adicione um novo usuário.
                </Typography>
              </div>
            )}
            <Grid container spacing={isMobile ? 1 : 2}>
              {users.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card
                    variant="outlined"
                    className={`${classes.entityCard} ${isMobile ? classes.mobileCard : ""}`}
                  >
                    <CardContent className={`${classes.entityCardContent} ${isMobile ? classes.mobileCardContent : ""}`}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} color="textPrimary" align="center">
                        {user.name}
                      </Typography>
                      <Typography variant="body2" align="center">
                        ID: {user.id}
                      </Typography>
                      <Typography variant="body2" align="center">
                        Status: <UserStatusIcon user={user} />
                      </Typography>
                      <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                        {renderProfileImage(user)}
                      </div>
                      <Typography variant="body2" align="center">
                        Email: {user.email}
                      </Typography>
                      <Typography variant="body2" align="center">
                        Perfil: {user.profile}
                      </Typography>
                      {!isMobile && (
                        <>
                          <Typography variant="body2" align="center">
                            Início: {user.startWork || "N/A"}
                          </Typography>
                          <Typography variant="body2" align="center">
                            Fim: {user.endWork || "N/A"}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                    {renderCardActions(user)}
                  </Card>
                </Grid>
              ))}
              {loadingMore && (
                <Grid item xs={12} align="center">
                  <CircularProgress />
                </Grid>
              )}
            </Grid>
            {loading && !loadingMore && (
              <div className={classes.loadingContainer}>
                <CircularProgress />
                <span className={classes.loadingText}>{i18n.t("loading")}</span>
              </div>
            )}
            <div ref={loadMoreSentinelRef} />
          </GlassCard>
        </>
      }
    </MainContainer>
  );
};

export default Users;
