import React from 'react';
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@material-ui/core';

// Show a modal progress dialog with top artist info while we shuffle the tracks

export default function PlaylistProgressModal(props) {

  const artistStats = function (artists) {

    if (!artists || artists.length == 0) {
      return (
        <Alert severity="info">Loading artists...</Alert>
      );
    }

    const rows = [];
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];

      // only show artists with at least 2 tracks
      if (artist.artist != '[singles]') {
        rows.push(
          <TableRow>
            <TableCell>
              {artist.artist}
            </TableCell>
            <TableCell align="right">
              {artist.length}
            </TableCell>
          </TableRow>
        );
      }

    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              Top Artists
              </TableCell>
            <TableCell align="right">
              Tracks
              </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows}
        </TableBody>
      </Table>
    );

  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">Shuffling {props.playlist}</DialogTitle>

      <LinearProgress variant="determinate" value={props.percentComplete}></LinearProgress>

      <DialogContent>

        <div style={{ minHeight: '200px', maxHeight: '200px' }}>
          {artistStats(props.artists)}
        </div>
      </DialogContent>

    </Dialog>
  );
}