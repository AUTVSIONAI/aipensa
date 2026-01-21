import React, { useContext, useState } from "react";
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
} from "@material-ui/core";

import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "calc(100% - 58px)",
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  listItemActive: {
    cursor: "pointer",
    backgroundColor: theme.palette.background.paper,
    borderLeft: "6px solid #002d6e",
  },
  listItem: {
    cursor: "pointer",
    backgroundColor: theme.palette.background.color,
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    const mainText = chat.title;
    const unreads = unreadMessages(chat);
    return (
      <>
        {mainText}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 5 }}
            label={unreads}
            color="secondary"
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    return datetimeToClient(chat.updatedAt); // Exibe apenas a data e horário da última atualização
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <List>
            {Array.isArray(chats) &&
              chats.length > 0 &&
              chats.map((chat, key) => (
                <ListItem
                  onClick={() => goToMessages(chat)}
                  key={key}
                  className={chat.uuid === id ? classes.listItemActive : classes.listItem}
                  button
                >
                  <ListItemText
                    primary={getPrimaryText(chat)}
                    secondary={getSecondaryText(chat)} // Exibe a data e horário
                  />
                  {chat.ownerId === user.id && (
<ListItemSecondaryAction style={{ display: "flex", gap: "10px" }}>
  <IconButton
    onClick={() => {
      goToMessages(chat).then(() => {
        handleEditChat(chat);
      });
    }}
    size="small"
    style={{
      backgroundColor: "#40BFFF", // Azul claro
      padding: "8px",
      borderRadius: "10px",
    }}
    title="Editar Conversa"
  >
    <EditIcon style={{ color: "#fff" }} />
  </IconButton>

  <IconButton
    onClick={() => {
      setSelectedChat(chat);
      setConfirmModalOpen(true);
    }}
    size="small"
    style={{
      backgroundColor: "#FF6B6B", // Vermelho claro
      padding: "8px",
      borderRadius: "10px",
    }}
    title="Excluir Conversa"
  >
    <DeleteIcon style={{ color: "#fff" }} />
  </IconButton>
</ListItemSecondaryAction>

                  )}
                </ListItem>
              ))}
          </List>
        </div>
      </div>
    </>
  );
}