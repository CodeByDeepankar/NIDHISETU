declare module 'expo-media-library' {
  export type MediaLibraryPermissionStatus = 'undetermined' | 'granted' | 'denied';

  export interface MediaLibraryPermissionResponse {
    status: MediaLibraryPermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never' | number;
  }

  export function usePermissions(): [
    MediaLibraryPermissionResponse | undefined,
    (options?: { requestAgain?: boolean }) => Promise<MediaLibraryPermissionResponse>
  ];

  export function requestPermissionsAsync(): Promise<MediaLibraryPermissionResponse>;

  export function saveToLibraryAsync(assetUri: string): Promise<void>;
}
