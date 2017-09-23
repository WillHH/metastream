import React, { Component } from 'react';
import cx from 'classnames';
import styles from './PlaybackControls.css';
import { PlaybackState, IMediaItem, IMediaPlayerState } from 'lobby/reducers/mediaPlayer';
import { Time } from 'components/media/Time';
import { VolumeSlider } from 'components/media/VolumeSlider';
import { netConnect, ILobbyNetState } from 'lobby';
import { DispatchProp } from 'react-redux';
import {
  server_requestPlayPause,
  server_requestNextMedia,
  server_requestSeek
} from 'lobby/actions/mediaPlayer';
import { setVolume, setMute } from 'lobby/actions/settings';
import { Icon } from 'components/Icon';
import { Timeline } from 'components/media/Timeline';
import { push } from 'react-router-redux';

interface IProps {
  className?: string;
  reload?: React.MouseEventHandler<HTMLButtonElement>;
  debug?: React.MouseEventHandler<HTMLButtonElement>;
}

interface IConnectedProps extends IMediaPlayerState {
  mute: boolean;
  volume: number;
}

const mapStateToProps = (state: ILobbyNetState): IConnectedProps => {
  return {
    ...state.mediaPlayer,
    mute: state.settings.mute,
    volume: state.settings.volume
  };
};

type PrivateProps = IProps & IConnectedProps & DispatchProp<ILobbyNetState>;

class _PlaybackControls extends Component<PrivateProps> {
  render(): JSX.Element | null {
    const { current: media, playback, startTime, pauseTime } = this.props;
    const playbackIcon = playback === PlaybackState.Playing ? 'pause' : 'play';

    const isIdle = playback === PlaybackState.Idle;
    const isPaused = playback === PlaybackState.Paused;
    const duration = (media && media.duration) || 0;

    return (
      <div className={cx(this.props.className, styles.container)}>
        <button type="button" className={styles.button} disabled={isIdle} onClick={this.playPause}>
          <Icon name={playbackIcon} />
        </button>
        <button
          type="button"
          title="Next"
          className={styles.button}
          disabled={isIdle}
          onClick={this.next}
        >
          <Icon name="skip-forward" />
        </button>
        {isIdle ? (
          <span className={styles.spacer} />
        ) : (
          <Timeline
            className={styles.spacer}
            time={(isPaused ? pauseTime : startTime) || 0}
            paused={isPaused}
            duration={media && media.duration}
            onSeek={this.seek}
          />
        )}
        <VolumeSlider
          mute={this.props.mute}
          volume={this.props.volume}
          onChange={this.setVolume}
          onMute={this.toggleMute}
        />
        <button type="button" className={styles.button} title="Reload" onClick={this.props.reload}>
          <Icon name="rotate-cw" />
        </button>
        <button type="button" className={styles.button} title="Debug" onClick={this.props.debug}>
          <Icon name="settings" />
        </button>
        <button
          type="button"
          className={styles.button}
          title="Disconnect"
          onClick={this.disconnect}
        >
          <Icon name="log-out" />
        </button>
      </div>
    );
  }

  private playPause = () => {
    this.props.dispatch!(server_requestPlayPause());
  };

  private next = () => {
    this.props.dispatch!(server_requestNextMedia());
  };

  private seek = (time: number) => {
    this.props.dispatch!(server_requestSeek(time));
  };

  private setVolume = (volume: number) => {
    this.props.dispatch!(setVolume(volume));
  };

  private toggleMute = () => {
    const mute = !this.props.mute;
    this.props.dispatch!(setMute(mute));
  };

  private disconnect = () => {
    // TODO: Use react-router-redux actions after refactoring to not use
    // multiple redux stores
    window.location.hash = '#/';
  };
}

export const PlaybackControls = netConnect<{}, {}, IProps>(mapStateToProps)(_PlaybackControls);
