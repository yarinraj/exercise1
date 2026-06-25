import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Toast = ({ message, type = 'info', onClose }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#2e7d32'; 
            case 'error': return '#d32f2f';   
            case 'info':
            default: return '#0288d1';       
        }
    };

    if (!message) return null;

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
            <Text style={styles.text}>{message}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50, 
        left: 20,
        right: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, 
        zIndex: 9999, 
    },
    text: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        textAlign: 'left',
    },
    closeButton: {
        marginLeft: 10,
        padding: 4,
    },
    closeText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Toast;
