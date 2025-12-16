package com.braintrust.education.application.dtos.dtos;

import org.springframework.data.domain.Page;

import java.util.List;

public class PaginatedResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    // No-args constructor
    public PaginatedResponse() {
    }

    // All-args constructor
    public PaginatedResponse(List<T> content, int pageNumber, int pageSize,
                             long totalElements, int totalPages, boolean first, boolean last) {
        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    // Factory method
    public static <T> PaginatedResponse<T> fromPage(Page<T> page) {
        return new PaginatedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    // Getters and setters
    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    // toString() method for debugging
    @Override
    public String toString() {
        return "PaginatedResponse{" +
                "contentSize=" + (content != null ? content.size() : 0) +
                ", pageNumber=" + pageNumber +
                ", pageSize=" + pageSize +
                ", totalElements=" + totalElements +
                ", totalPages=" + totalPages +
                ", first=" + first +
                ", last=" + last +
                '}';
    }

    // equals() and hashCode() methods (optional but recommended)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PaginatedResponse<?> that = (PaginatedResponse<?>) o;

        if (pageNumber != that.pageNumber) return false;
        if (pageSize != that.pageSize) return false;
        if (totalElements != that.totalElements) return false;
        if (totalPages != that.totalPages) return false;
        if (first != that.first) return false;
        if (last != that.last) return false;
        return content != null ? content.equals(that.content) : that.content == null;
    }

    @Override
    public int hashCode() {
        int result = content != null ? content.hashCode() : 0;
        result = 31 * result + pageNumber;
        result = 31 * result + pageSize;
        result = 31 * result + (int) (totalElements ^ (totalElements >>> 32));
        result = 31 * result + totalPages;
        result = 31 * result + (first ? 1 : 0);
        result = 31 * result + (last ? 1 : 0);
        return result;
    }
}