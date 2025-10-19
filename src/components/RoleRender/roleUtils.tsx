import { useTranslation } from 'react-i18next';

const roleList = ['public', 'common', 'research', 'explorer', 'team', 'enterprise1', 'enterprise2', 'enterprise3', 'joint', 'admin'] as const;
const roleColor: Record<(typeof roleList)[number], string> = {
    public: '#e5e6e8',
    common: '#e5e6e8',
    research: '#c6f0c1',
    explorer: '#cedcfe',
    team: '#cedcfe',
    enterprise1: '#ffe928',
    enterprise2: '#ffe928',
    enterprise3: '#ffe928',
    joint: '#ffe928',
    admin: '#baac34'
};
const roleConfig = {
    common: {
        name: 'common',
        description: 'Common',
        permissions: ['common']
    },
}
const useRoleConfig = () => {
    const { t } = useTranslation();
    return Object.fromEntries(roleList.map((role) => {
        return [role, {
            name: t(`role.${role}`),
            color: roleColor[role]
        }]
    }));
}

export default roleList;
export { roleConfig, useRoleConfig };
