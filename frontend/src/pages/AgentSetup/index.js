import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";

import Connections from "../Connections";
import Prompts from "../Prompts";
import Queues from "../Queues";
import FlowBuilder from "../FlowBuilder";
import QueueIntegration from "../QueueIntegration";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  tabsPaper: {
    borderRadius: 0,
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    zIndex: 1, // Ensure tabs are above content if needed
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
  },
}));

const AgentSetup = () => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.tabsPaper}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<WhatsAppIcon />} label={i18n.t("mainDrawer.listItems.connections")} />
          <Tab icon={<AndroidIcon />} label={i18n.t("mainDrawer.listItems.prompts")} />
          <Tab icon={<AccountTreeIcon />} label={i18n.t("mainDrawer.listItems.queues")} />
          <Tab icon={<AccountTreeIcon />} label="Flowbuilder" />
          <Tab icon={<DeviceHubIcon />} label="Integrações" />
        </Tabs>
      </Paper>
      
      <div className={classes.content}>
        {tab === 0 && <Connections />}
        {tab === 1 && <Prompts />}
        {tab === 2 && <Queues />}
        {tab === 3 && <FlowBuilder />}
        {tab === 4 && <QueueIntegration />}
      </div>
    </div>
  );
};

export default AgentSetup;
