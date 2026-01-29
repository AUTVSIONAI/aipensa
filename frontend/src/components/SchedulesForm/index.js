import React, { useState, useEffect } from "react";
import { makeStyles, TextField, Grid } from "@material-ui/core";
import { Formik, Form, FastField, FieldArray } from "formik";
import { isArray } from "lodash";
import NumberFormat from "react-number-format";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { i18n } from "../../translate/i18n";
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InputAdornment from '@mui/material/InputAdornment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  textfield: {
    width: "100%",
    fontSize: "0.875em"
  },
  row: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  control: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
  },
  mobileDayHeader: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.45)" : "rgba(255, 255, 255, 0.85)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(16px)",
  },
  dayCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.45)" : "rgba(255, 255, 255, 0.85)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(16px)",
    boxShadow: theme.palette.type === "dark" ? "0 12px 32px rgba(0,0,0,0.35)" : "0 6px 18px rgba(0,0,0,0.06)",
  },
  saveButton: {
    color: "white",
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, #bd00ff 90%)`,
    borderRadius: 12,
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 600,
    boxShadow: `0 0 18px rgba(0, 242, 255, 0.25)`,
  },
}));

function SchedulesForm(props) {
  const { initialValues, onSubmit, loading, labelSaveButton } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [schedules, setSchedules] = useState([
    { weekday: i18n.t("queueModal.serviceHours.monday"), weekdayEn: "monday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
    { weekday: i18n.t("queueModal.serviceHours.tuesday"), weekdayEn: "tuesday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
    { weekday: i18n.t("queueModal.serviceHours.wednesday"), weekdayEn: "wednesday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
    { weekday: i18n.t("queueModal.serviceHours.thursday"), weekdayEn: "thursday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
    { weekday: i18n.t("queueModal.serviceHours.friday"), weekdayEn: "friday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
    { weekday: i18n.t("queueModal.serviceHours.saturday"), weekdayEn: "saturday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
    { weekday: i18n.t("queueModal.serviceHours.sunday"), weekdayEn: "sunday", startTimeA: "", endTimeA: "", startTimeB: "", endTimeB: "", },
  ]);

  useEffect(() => {
    if (isArray(initialValues) && initialValues.length > 0) {
      setSchedules(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const renderDaySchedule = (item, index) => {
    if (isMobile) {
      return (
        <Grid key={index} xs={12} item>
          <div className={classes.dayCard}>
          <div className={classes.mobileDayHeader}>
            <FastField
              as={TextField}
              label={i18n.t("queueModal.serviceHours.dayWeek")}
              name={`schedules[${index}].weekday`}
              disabled
              variant="standard"
              className={classes.fullWidth}
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
            />
          </div>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FastField
                label={i18n.t("queueModal.serviceHours.startTimeA")}
                name={`schedules[${index}].startTimeA`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label="Início A"
                    size="small"
                  />
                )}
              </FastField>
            </Grid>
            <Grid item xs={6}>
              <FastField
                label={i18n.t("queueModal.serviceHours.endTimeA")}
                name={`schedules[${index}].endTimeA`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label="Fim A"
                    size="small"
                  />
                )}
              </FastField>
            </Grid>
            <Grid item xs={6}>
              <FastField
                label={i18n.t("queueModal.serviceHours.startTimeB")}
                name={`schedules[${index}].startTimeB`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label="Início B"
                    size="small"
                  />
                )}
              </FastField>
            </Grid>
            <Grid item xs={6}>
              <FastField
                label={i18n.t("queueModal.serviceHours.endTimeB")}
                name={`schedules[${index}].endTimeB`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label="Fim B"
                    size="small"
                  />
                )}
              </FastField>
            </Grid>
          </Grid>
          </div>
        </Grid>
      );
    } else {
      return (
        <Grid key={index} xs={12} md={4} item>
          <div className={classes.dayCard}>
          <Grid container>
            <Grid className={classes.control} xs={12} item>
              <FastField
                as={TextField}
                label={i18n.t("queueModal.serviceHours.dayWeek")}
                name={`schedules[${index}].weekday`}
                disabled
                variant="outlined"
                className={classes.fullWidth}
                margin="dense"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid className={classes.control} xs={12} md={6} item>
              <FastField
                label={i18n.t("queueModal.serviceHours.startTimeA")}
                name={`schedules[${index}].startTimeA`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label={i18n.t("queueModal.serviceHours.startTimeA")}
                  />
                )}
              </FastField>
            </Grid>
            <Grid className={classes.control} xs={12} md={6} item>
              <FastField
                label={i18n.t("queueModal.serviceHours.endTimeA")}
                name={`schedules[${index}].endTimeA`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label={i18n.t("queueModal.serviceHours.endTimeA")}
                  />
                )}
              </FastField>
            </Grid>
            <Grid className={classes.control} xs={12} md={6} item>
              <FastField
                label={i18n.t("queueModal.serviceHours.startTimeB")}
                name={`schedules[${index}].startTimeB`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label={i18n.t("queueModal.serviceHours.startTimeB")}
                  />
                )}
              </FastField>
            </Grid>
            <Grid className={classes.control} xs={12} md={6} item>
              <FastField
                label={i18n.t("queueModal.serviceHours.endTimeB")}
                name={`schedules[${index}].endTimeB`}
              >
                {({ field }) => (
                  <NumberFormat
                    {...field}
                    variant="outlined"
                    margin="dense"
                    customInput={TextField}
                    format="##:##"
                    className={classes.fullWidth}
                    label={i18n.t("queueModal.serviceHours.endTimeB")}
                  />
                )}
              </FastField>
            </Grid>
          </Grid>
          </div>
        </Grid>
      );
    }
  };

  return (
    <Formik
      enableReinitialize
      className={classes.fullWidth}
      initialValues={{ schedules }}
      onSubmit={({ schedules }) =>
        setTimeout(() => {
          handleSubmit(schedules);
        }, 500)
      }
    >
      {({ values }) => (
        <Form className={classes.fullWidth}>
          <FieldArray
            name="schedules"
            render={() => (
              <Grid container spacing={isMobile ? 1 : 4}>
                {values.schedules.map((item, index) => renderDaySchedule(item, index))}
              </Grid>
            )}
          ></FieldArray>
          <div className={classes.buttonContainer}>
            <ButtonWithSpinner
              startIcon={<SaveIcon />}
              loading={loading}
              type="submit"
              className={classes.saveButton}
              variant="contained"
            >
              {labelSaveButton ?? i18n.t("whatsappModal.buttons.okEdit")}
            </ButtonWithSpinner>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default SchedulesForm;
