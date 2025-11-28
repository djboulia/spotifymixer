import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@material-ui/core';

// Show a modal progress dialog with top category info while we shuffle the tracks

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
  },
  name: {
    display: 'flex',
    width: '66%',
    justifyContent: 'space-between',
    gap: '25px',
    flexDirection: 'row',

    // small screens - stack the title and currently shuffling playlist number
    [theme.breakpoints.down('sm')]: {
      gap: '0px',
      flexDirection: 'column',
    },
  },
}));

export default function PlaylistProgressModal(props) {
  const classes = useStyles();

  const categoryStats = function (categories) {
    console.log('categories: ', categories);
    if (!categories || categories?.length === 0) {
      return <Alert severity="info">Loading categories...</Alert>;
    }

    const rows = [];
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      // only show categories with at least 2 tracks
      if (category.category != '[singles]') {
        rows.push(
          <TableRow key={i}>
            <TableCell>{category.category}</TableCell>
            <TableCell>{category.type === 'artist' ? 'Artist' : 'Title'}</TableCell>
            <TableCell align="right">{category.length}</TableCell>
          </TableRow>,
        );
      }
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Top Tracks</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Songs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    );
  };

  const multipleStatus = function (status) {
    if (!status || status.total <= 1) {
      return '';
    }

    return (
      <div>
        {status.current} of {status.total}
      </div>
    );
  };

  return (
    <Dialog fullWidth={true} maxWidth="sm" aria-labelledby="simple-dialog-title" open={true}>
      <DialogTitle id="simple-dialog-title">
        <div className={classes.title}>
          <div className={classes.name}>
            Shuffling {props.playlist.name} {multipleStatus(props.multipleStatus)}
          </div>
          <img src={props.playlist.img} height="40" />
        </div>
      </DialogTitle>

      <LinearProgress variant="determinate" value={props.percentComplete}></LinearProgress>

      <DialogContent>
        <div style={{ minHeight: '200px', maxHeight: '200px' }}>
          {categoryStats(props.categories)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
