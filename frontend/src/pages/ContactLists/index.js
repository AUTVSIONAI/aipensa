import React, { useState, useEffect, useReducer, useContext, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import CircularProgress from "@mui/material/CircularProgress";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import PeopleIcon from "@material-ui/icons/People";
import DownloadIcon from "@material-ui/icons/GetApp";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import GlassCard from "../../components/UI/GlassCard";
import PrimaryButton from "../../components/UI/PrimaryButton";
import OutlinedButton from "../../components/UI/OutlinedButton";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";


import planilhaExemplo from "../../assets/planilha.xlsx";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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
  actions: {
    justifyContent: "center",
    gap: theme.spacing(1.25),
    paddingBottom: theme.spacing(2),
  },
  searchIcon: {
    color: theme.palette.primary.main,
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);


  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;

    const onContactListEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    };

    socket.on(`company-${companyId}-ContactList`, onContactListEvent);

    return () => {
      socket.off(`company-${companyId}-ContactList`, onContactListEvent);
    };
  }, [socket, user.companyId]);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
    setSearchParam("");
    setPageNumber(1);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>{i18n.t("contactLists.title")}</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={7} sm={6} item>
                <TextField
                  fullWidth
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
                />
              </Grid>
              <Grid xs={5} sm={6} item>
                <PrimaryButton fullWidth onClick={handleOpenContactListModal}>
                  {i18n.t("contactLists.buttons.add")}
                </PrimaryButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <GlassCard className={classes.mainPaper}>
<Grid container spacing={2}>
  {!loading && contactLists.length === 0 && (
    <Grid item xs={12}>
      <div className={classes.emptyState}>
        <Typography variant="subtitle1" color="text.primary">
          Nenhuma lista encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crie uma lista ou ajuste a busca.
        </Typography>
      </div>
    </Grid>
  )}
  {contactLists.map((contactList) => (
      <Grid item xs={12} sm={6} md={4} key={contactList.id}>
        <Card
          variant="outlined"
          className={classes.entityCard}
       >
          <CardContent>
            <Typography variant="h6" color="text.primary" align="center">
              {contactList.name}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Contatos: {contactList.contactsCount || 0}
            </Typography>
          </CardContent>
          <CardActions className={classes.actions}>
            <OutlinedButton
              component="a"
              href={planilhaExemplo}
              download="planilha.xlsx"
              title="Baixar Planilha Exemplo"
              startIcon={<DownloadIcon />}
            >
              Planilha
            </OutlinedButton>
            <OutlinedButton
              size="small"
              onClick={() => goToContacts(contactList.id)}
              title="Ver Contatos"
              startIcon={<PeopleIcon />}
            >
              Contatos
            </OutlinedButton>
            <OutlinedButton
              size="small"
              onClick={() => handleEditContactList(contactList)}
              title="Editar Lista"
              startIcon={<EditIcon />}
            >
              Editar
            </OutlinedButton>
            <OutlinedButton
              size="small"
              onClick={() => {
                setConfirmModalOpen(true);
                setDeletingContactList(contactList);
              }}
              title="Excluir Lista"
              startIcon={<DeleteOutlineIcon />}
            >
              Excluir
            </OutlinedButton>
</CardActions>
        </Card>
      </Grid>
    ))}
  {loading && (
    <Grid item xs={12}>
      <CircularProgress style={{ display: "block", margin: "16px auto" }} />
    </Grid>
  )}
</Grid>
        <div ref={loadMoreSentinelRef} />
      </GlassCard>
    </MainContainer>
  );
};

export default ContactLists;
