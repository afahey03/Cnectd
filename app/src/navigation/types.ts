export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Friends: undefined;
  Chat: { conversationId: string; title?: string };
  NewGroup: undefined;
};
