declare module 'xlsx' {
  export function read(data: any, opts?: any): any;
  export namespace utils {
    export function sheet_to_json(worksheet: any, opts?: any): any[];
  }
} 