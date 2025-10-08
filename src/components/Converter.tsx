// src/components/Converter.tsx

import FileUploader from './FileUploader';

/**
 * The Converter component now acts as a simple, clean wrapper.
 * The FileUploader component is self-contained and handles all the logic
 * for file selection, password input, data preview, and conversion.
 *
 * This new structure eliminates the previous errors and warnings about
 * unused variables and incorrect props.
 */
const Converter = () => {
  return <FileUploader />;
};

export default Converter;
