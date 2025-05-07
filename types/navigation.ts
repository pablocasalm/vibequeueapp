export type TabStackParamList = {
  index: undefined;
  earnings: undefined;
  history: undefined;
  profile: undefined;
};

export type EventStackParamList = {
  index: undefined;
  event: { id: string };
};

export type RootStackParamList = {
  '(tabs)': undefined;
  'event/[id]': { id: string };
  'modal/cash-out': undefined;
  'modal/change-password': undefined;
  'modal/event-settings': { id: string };
  'modal/create-event': undefined;
};