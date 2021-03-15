guild: 
<ref *1> Guild {
  members: GuildMemberManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(2) [Map] {
      '821022053896421406' => [GuildMember],
      '365579546256343060' => [GuildMember]
    },
    guild: [Circular *1]
  },
  channels: GuildChannelManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(4) [Map] {
      '821037320635547651' => [CategoryChannel],
      '821037320635547652' => [CategoryChannel],
      '821037320635547653' => [TextChannel],
      '821037320635547654' => [VoiceChannel]
    },
    guild: [Circular *1]
  },
  roles: RoleManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(2) [Map] {
      '821037320635547649' => [Role],
      '821037439341821963' => [Role]
    },
    guild: [Circular *1]
  },
  presences: PresenceManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(0) [Map] {}
  },
  voiceStates: VoiceStateManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(1) [Map] { '365579546256343060' => [VoiceState] },
    guild: [Circular *1]
  },
  deleted: false,
  available: true,
  id: '821037320635547649',
  shardID: 0,
  name: 'JD',
  icon: null,
  splash: null,
  discoverySplash: null,
  region: 'europe',
  memberCount: 2,
  large: false,
  features: [],
  applicationID: null,
  afkTimeout: 300,
  afkChannelID: null,
  systemChannelID: '821037320635547653',
  embedEnabled: undefined,
  premiumTier: 0,
  premiumSubscriptionCount: 0,
  verificationLevel: 'NONE',
  explicitContentFilter: 'DISABLED',
  mfaLevel: 0,
  joinedTimestamp: 1615820979725,
  defaultMessageNotifications: 'ALL',
  systemChannelFlags: SystemChannelFlags { bitfield: 0 },
  maximumMembers: 100000,
  maximumPresences: null,
  approximateMemberCount: null,
  approximatePresenceCount: null,
  vanityURLCode: null,
  vanityURLUses: null,
  description: null,
  banner: null,
  rulesChannelID: null,
  publicUpdatesChannelID: null,
  preferredLocale: 'en-US',
  ownerID: '365579546256343060',
  emojis: GuildEmojiManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(0) [Map] {},
    guild: [Circular *1]
  }
}