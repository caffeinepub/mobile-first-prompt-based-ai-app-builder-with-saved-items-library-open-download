export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    // Backend authorization errors
    if (error.message.includes('Unauthorized') || error.message.includes('Anonymous users')) {
      return 'You do not have permission to perform this action. Please sign in.';
    }
    
    // Backend trap messages
    if (error.message.includes('not found') || error.message.includes('Item not found')) {
      return 'The requested item was not found.';
    }
    
    if (error.message.includes('Content cannot be empty')) {
      return 'Content cannot be empty. Please provide valid data.';
    }
    
    // Network and agent errors
    if (error.message.includes('Actor not available') || error.message.includes('actor')) {
      return 'Connection to backend is not available. Please refresh the page and try again.';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Calculator errors
    if (error.message.includes('Invalid expression') || error.message.includes('Invalid calculation')) {
      return 'Invalid expression. Please check your input and try again.';
    }
    
    if (error.message.includes('Mismatched parentheses')) {
      return 'Mismatched parentheses. Please check your expression.';
    }
    
    if (error.message.includes('divide') || error.message.includes('division')) {
      return 'Cannot divide by zero.';
    }
    
    // Download and export errors
    if (error.message.includes('download') || error.message.includes('blocked')) {
      return 'Download was blocked by your browser. Please check your browser settings and allow downloads.';
    }
    
    if (error.message.includes('permission')) {
      return 'Browser permission denied. Please allow file downloads in your browser settings.';
    }
    
    if (error.message.includes('HTML export') || error.message.includes('export')) {
      return 'Failed to export file. Please try again.';
    }
    
    if (error.message.includes('clipboard')) {
      return 'Failed to copy to clipboard. Please try copying manually.';
    }
    
    // Parsing errors
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return 'Invalid data format. The creation data may be corrupted.';
    }
    
    // Return the original message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('stack') && !error.message.includes('at ')) {
      return error.message;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}
