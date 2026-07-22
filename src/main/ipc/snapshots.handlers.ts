import { snapshotService } from '../services/snapshotService';
import type { IpcContract } from '@shared/ipc/contract';

type SnapshotHandlers = Pick<
  IpcContract,
  'snapshots:list' | 'snapshots:save' | 'snapshots:delete' | 'snapshots:export' | 'snapshots:import'
>;

type Handlers = {
  [K in keyof SnapshotHandlers]: (
    req: SnapshotHandlers[K]['request'],
  ) => Promise<SnapshotHandlers[K]['response']>;
};

export function createSnapshotHandlers(): Handlers {
  return {
    'snapshots:list': async () => {
      return await snapshotService.listSnapshots();
    },
    'snapshots:save': async (payload) => {
      return await snapshotService.saveSnapshot(payload);
    },
    'snapshots:delete': async ({ id }) => {
      return await snapshotService.deleteSnapshot(id);
    },
    'snapshots:export': async ({ snapshotId }) => {
      return await snapshotService.exportSnapshot(snapshotId);
    },
    'snapshots:import': async () => {
      return await snapshotService.importSnapshot();
    },
  };
}
