import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import colors from '@/app/Colors';

const WorkhouseScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("workhouse")}</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/screens/workhouse/list-workhouse')}
                >
                    <Text style={styles.buttonText}>{t("list_workhouse")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/screens/workhouse/assign-freelance')}
                >
                    <Text style={styles.buttonText}>{t("assign_freelance")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/screens/workhouse/edit-workhouse')}
                >
                    <Text style={styles.buttonText}>{t("edit_workhouse")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBackground,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.header,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.darkText,
    },
    content: {
        padding: 16,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonText: {
        color: colors.lightText,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WorkhouseScreen;
