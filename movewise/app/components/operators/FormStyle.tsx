import colors from '@/app/Colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // En tu FormStyle.ts
  // En FormStyle.ts
  disabled: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  imageText: {
    color: '#0458AB',
    fontWeight: '500',
  },
  filename: {
    color: '#64748b',
    fontSize: 12,
  },
  placeholder: {
    color: '#94a3b8',
  },
  disabledContainer: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  imageSelectedText: {
    color: '#0458AB',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100%'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#0066cc',
  },
  inactiveStep: {
    backgroundColor: '#cccccc',
  },
  stepText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#cccccc',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  stepForm: {
    flex: 1,
    margin: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#112A4A',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
  required: {
    color: '#e63946',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#3b5998',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  iconButton: {
    marginLeft: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  dateIcon: {
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radioGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0066cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066cc',
  },
  radioLabel: {
    fontSize: 14,
  },
  imageUploadContainer: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  sonsList: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
  },
  sonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  removeButton: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addSonForm: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  imageFilename: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  placeholderText: {
    color: '#a0aec0',
    fontSize: 14,
  },
  inputError: {
    borderColor: 'red'
  },

  phoneContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 50,
    overflow: 'hidden',
  },

  phoneTextContainer: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    flex: 1,
    height: 48,
    paddingVertical: 0,
    paddingLeft: 0,
    justifyContent: 'center',
  },

  phoneTextInput: {
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 12,
    includeFontPadding: false,
    textAlignVertical: 'center',
    height: 48,
    margin: 0,
  },

  phoneCodeText: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
    textAlignVertical: 'center',
    lineHeight: 20,
    marginLeft: 6,
    marginRight: 4,
  },

  phoneFlagButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    width: 90,
  },

  // Añade este nuevo estilo para el contenedor de la bandera
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  flagImage: {
    width: 24,
    height: 16,
    marginRight: 6,
  },

  phoneCountryPicker: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 4,
  },

  dropdownArrow: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.textLight, // Color por defecto
  },

});

export default styles;