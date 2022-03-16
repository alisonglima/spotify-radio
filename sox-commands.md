### Sox Commands

- Audio information

  ```bash
  sox \
    --i \
    "audio/songs/conversation.mp3"
  ```

- Audio information - get bitrate only

  ```bash
  sox \
    --i \
    -B \
    "audio/songs/conversation.mp3"
  ```

- Audio treatment - covert to same bitrate

  ```bash
  sox \
    -v 0.99 \
    -t mp3 \
    "audio/fx/Applause Sound Effect HD No Copyright (128 kbps).mp3" \
    -r 48000 \
    -t mp3 \
    "output.mp3"
  ```

- Audio treatment - concatenate two audios

  ```bash
  sox \
    -t mp3 \
    -v 0.99 \
    -m "audio/songs/conversation.mp3" \
    -t mp3 \
    -v 0.99 \
    -m "audio/fx/Fart - Gaming Sound Effect (HD) (128 kbps).mp3" \
    -t mp3 \
    "output.mp3"
  ```

- Audio treatment - convert to 128k bitrate

  ```bash
  sox \

  ```
