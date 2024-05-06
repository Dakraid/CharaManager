// Database related responses
import type { StatusResponse } from '~/models/StatusResponse';

export const status_success_database_connected: StatusResponse = { status: 200, message: 'Database connected.' };
export const status_success_database_synced: StatusResponse = { status: 200, message: 'Database synchronized.' };

// Character upload related responses
export const status_success_characters_uploaded: StatusResponse = { status: 201, message: 'All uploads successful.' };
export const status_success_characters_uploaded_withConflict: StatusResponse = { status: 200, message: '' };

export const status_success_characters_deleted: StatusResponse = { status: 200, message: 'Character deleted.' };
export const status_success_characters_all_deleted: StatusResponse = {
    status: 200,
    message: 'All character deleted, database purged.',
};
export const status_failure_characters_deleted: StatusResponse = {
    status: 400,
    message: 'Could not delete character. Refresh the list to confirm it is still valid.',
};

// Character count related responses
export const status_success_characters_count: StatusResponse = { status: 200, message: '' };

// Character retrieval related responses
export const status_success_characters_get: StatusResponse = {
    status: 200,
    message: 'Characters delivered.',
    content: undefined,
};

export const status_failure_characters_get: StatusResponse = { status: 400, message: 'No characters found.' };

export const status_success_character_get: StatusResponse = { status: 200, message: 'Character delivered.', content: undefined };

// Chub.ai character download related responses
export const status_success_chubai_get: StatusResponse = {
    status: 200,
    message: 'Character download successful.',
    content: undefined,
};
export const status_failure_chubai_get: StatusResponse = { status: 400, message: 'Failed to download character.', content: undefined };
