import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  headerBlock: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
  },
  clearBtn: {
    fontSize: 15,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 10,
    gap: 10,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitButton: {
    height: 52,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    height: 48,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
