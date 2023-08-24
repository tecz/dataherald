import { UserProfile } from '@auth0/nextjs-auth0/client'

export interface Organization {
  id: string
  name: string
  slack_workspace_id: string
}

// TODO temoporary class
export interface AuthUser extends UserProfile {
  slack_id?: string
  organization_name: string
}

export interface User extends UserProfile {
  slack_id?: string
  organization: Organization
}

export enum EQueryStatus {
  SQL_ERROR = 'SQL_ERROR',
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
}

export type QueryStatus = 'SQL_ERROR' | 'NOT_VERIFIED' | 'VERIFIED'

export type QuerySqlResult = {
  columns: string[]
  rows: QuerySqlResultData[]
}

export type QuerySqlResultData = { [columnKey: string]: string | number }

export interface QueryListItem {
  id: string
  username: string
  question: string
  question_date: string
  nl_response: string
  status: QueryStatus
  evaluation_score: number
}

export type QueryList = QueryListItem[]

export interface Query {
  id: string
  question: string
  question_date: string
  sql_query: string
  sql_query_result: QuerySqlResult | null
  sql_error_message?: string
  ai_process: string[]
  nl_response: string
  status: QueryStatus
  evaluation_score: number
  username: string
  last_updated: string
}

export type Queries = Query[]